import React, { useEffect, useState } from "react";
import { Form, Input, Button, Select, message } from "antd";
import { IUser } from "../../interfaces/IUser";
import { getUser } from "../../services/userService"; 

interface UserFormProps {
  userId?: string | null; // Opcional para diferenciar entre creación y edición
  onSubmit: (updatedUser: IUser) => void;
  onCancel: () => void;
}

const fetchUserById = async (id: string): Promise<IUser | null> => {
  try {
    const user = await getUser(id);
    return user;
  } catch (error) {
    console.error(error);
    throw new Error("Error al obtener el usuario");
  }
};

const UserForm: React.FC<UserFormProps> = ({ userId, onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<IUser | null>(null); // Estado para el usuario 

  useEffect(() => {
    if (userId != null) {
      // Cargar datos del usuario si se proporciona userId
      setLoading(true);
      fetchUserById(userId)
        .then((data) => {
          setUser(data || null);
          form.setFieldsValue(data); // Prellenar el formulario
        })
        .catch(() => {
          message.error("Error al cargar los datos del usuario");
        })
        .finally(() => setLoading(false));
    } else {
      // Inicializar con valores predeterminados para un nuevo usuario
      setUser({
        nombre: "",
        apellido:"",
        username: "",
        email:"", 
        password: "", 
        enabled: true,
      });
      form.resetFields(); // Reinicia los campos del formulario
    }
  }, [userId, form]);

  useEffect(() => { 
    if (user) {
      form.setFieldsValue(user); // Sincroniza el formulario con el estado del usuario
    }
  }, [user, form]);

  const handleFinish = (values: any) => {
    const updatedUser = { ...user, ...values };
    onSubmit(updatedUser as IUser);
  };

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          nombre: user?.nombre || "",
          apellido: user?.apellido || "",
          username: user?.username || "",
          email: user?.email || "", 
          enabled: user?.enabled || true,
          password: "",
          newPassword: "",
        }}
      >
        <Form.Item
          label="Nombre"
          name="nombre"
          rules={[{ required: true, message: "Por favor, ingresa el nombre" }]}
        >
          <Input disabled={loading} />
        </Form.Item>

        <Form.Item
          label="Apellido"
          name="apellido"
          rules={[{ required: true, message: "Por favor, ingresa el apellido" }]}
        >
          <Input disabled={loading} />
        </Form.Item> 

        <Form.Item
          label="User"
          name="username"
          rules={[{ required: true, message: "Por favor, ingresa el username" }]}
        >
          <Input disabled={loading} />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Por favor, ingresa el email" },
            { type: "email", message: "Ingresa un email válido" },
          ]}
        >
          <Input disabled={loading} />
        </Form.Item>
  
        <Form.Item label="Estado" name="enabled" valuePropName="value">
          <Select disabled={loading}>
            <Select.Option value={true}>Habilitado</Select.Option>
            <Select.Option value={false}>Deshabilitado</Select.Option>
          </Select>
        </Form.Item>

        {!userId && (
          <>
            <Form.Item
              label="Ingresar contraseña"
              name="password"
              rules={[
                { required: true, message: "Por favor, ingresa tu contraseña." },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              label="Repetir Contraseña"
              name="newPassword"
              dependencies={["password"]} // Dependerá del valor de "password"
              rules={[
                { required: true, message: "Por favor, repite tu contraseña." },
                { min: 8, message: "La contraseña debe tener al menos 8 caracteres." },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Las contraseñas no coinciden.")
                    );
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
          </>
        )}

        <Form.Item>
          <div className="flex justify-end">
            <Button
              onClick={onCancel}
              style={{ marginRight: 8 }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {userId ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </Form.Item>
      </Form> 
    </>
  );
};

export default UserForm;
