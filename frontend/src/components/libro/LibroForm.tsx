import React, { useEffect } from "react";
import { Form, Input, Button, Checkbox, InputNumber } from "antd"; 
import { Libro } from "../../interfaces/ILibro";

interface LibroFormProps {
  initialValues?: Libro;
  onSubmit: (values: Libro) => void;
  onCancel: () => void;
  loading: boolean;
}

const LibroForm: React.FC<LibroFormProps> = ({ initialValues, onSubmit, onCancel, loading }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  const handleFinish = (values: Libro) => {
    onSubmit(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={initialValues}
    >
      <Form.Item
        label="Título"
        name="titulo"
        rules={[{ required: true, message: "Por favor, ingrese el título del libro" }]}
      >
        <Input disabled={loading} />
      </Form.Item>
      <Form.Item
        label="Autor"
        name="autor"
        rules={[{ required: true, message: "Por favor, ingrese el autor del libro" }]}
      >
        <Input disabled={loading} />
      </Form.Item>
      <Form.Item
        label="Género"
        name="genero"
        rules={[{ required: true, message: "Por favor, seleccione el género del libro" }]}
      >
        <Input disabled={loading} />
      </Form.Item>
      <Form.Item
        label="Editorial"
        name="editorial"
        rules={[{ required: true, message: "Por favor, ingrese la editorial del libro" }]}
      >
        <Input disabled={loading} />
      </Form.Item>
      <Form.Item
        label="Precio"
        name="precio"
        rules={[
          { required: true, message: "Por favor, ingrese el precio del libro" },
          { type: 'number', message: 'Por favor, ingrese un número' },
        ]}
      >
        <InputNumber min={0} disabled={loading} />
      </Form.Item>
      <Form.Item
        label="Disponibilidad"
        name="disponibilidad"
        valuePropName="checked"
      >
        <Checkbox disabled={loading} />
      </Form.Item>
      <Form.Item>
        <div className="flex justify-end">
          <Button onClick={onCancel} style={{ marginRight: 8 }} disabled={loading}>
            Cancelar
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Guardar
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default LibroForm;