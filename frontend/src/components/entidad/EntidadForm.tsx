import React, { useEffect } from 'react';
import { Button, Form, Input, InputNumber } from 'antd';
import { Entidad } from '../../interfaces/IEntidad';

interface EntidadFormProps {
  initialValues?: Entidad;
  onSubmit: (values: Omit<Entidad, 'id'>) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export const EntidadForm: React.FC<EntidadFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  loading,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      _id: initialValues?._id,
      codigo_entidad: initialValues?.codigo_entidad,
      suma_prestamos: initialValues?.suma_prestamos,
    });
  }, [form, initialValues]);

  const handleFinish = async (values: any) => {
    await onSubmit(values);
    form.resetFields();
  };

  return (
    <Form form={form} onFinish={handleFinish} layout="vertical">
      <Form.Item
        label="ID"
        name="_id"
        rules={[{ required: true, message: 'Por favor, ingrese el ID de la entidad' }]}
      >
        <Input disabled={loading} />
      </Form.Item>
      <Form.Item
        label="Código de Entidad"
        name="codigo_entidad"
        rules={[{ required: true, message: 'Por favor, ingrese el código de la entidad' }]}
      >
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item
        label="Suma de Préstamos"
        name="suma_prestamos"
        rules={[{ required: true, message: 'Por favor, ingrese la suma de los préstamos' }]}
      >
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>
      <div className="flex justify-end gap-2">
        <Button onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          Guardar
        </Button>
      </div>
    </Form>
  );
};
