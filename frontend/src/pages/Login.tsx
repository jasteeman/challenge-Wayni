import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../auth/AuthService";
import { Button, Card, Form, Input, Typography, Alert } from "antd"; 
import { userLoggedIn } from "../redux/slices/authSlices";
import { useDispatch } from "react-redux";

const { Title } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();


  const handleSubmit = async (values: { username: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await login(values);
      if (userData) {
        dispatch(userLoggedIn(userData.user));
        navigate("/home");
      } else {
        setError("Credenciales inválidas. Intente nuevamente.");
      }
    } catch (err) {
      setError("Credenciales inválidas. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f0f2f5" }}>
      <Card style={{ width: 400, padding: "20px 30px", borderRadius: 8 }}>
        <Title level={3} style={{ textAlign: "center", marginBottom: 20 }}>
          Iniciar Sesión
        </Title>
        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 20 }} />}
        <Form
          name="login"
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          initialValues={{ username: "", password: "" }}
        >
          <Form.Item
            label="User"
            name="username"
            rules={[{ required: true, message: "Por favor, ingrese su usuario" }]}
          >
            <Input placeholder="username" />
          </Form.Item>
          <Form.Item
            label="Contraseña"
            name="password"
            rules={[{ required: true, message: "Por favor, ingrese su contraseña" }]}
          >
            <Input.Password placeholder="Contraseña" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Ingresar
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
