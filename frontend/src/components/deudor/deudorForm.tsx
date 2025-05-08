import React, { useEffect } from 'react';
import { Button, Form, Input, InputNumber } from 'antd';
import { Deudor } from '../../interfaces/IDeudor';

interface DeudorFormProps {
  initialValues?: Deudor;
  onSubmit: (values: Omit<Deudor, 'id'> & { idDeudor: string; }) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export const DeudorForm: React.FC<DeudorFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  loading,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      _id: initialValues?._id,
      situacion_desfavorable: initialValues?.situacion_desfavorable,
      suma_prestamos: initialValues?.suma_prestamos,
      numero_identificacion: initialValues?.numero_identificacion
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
        rules={[{ required: true, message: 'Por favor, ingrese el ID del deudor' }]}
      >
        <Input disabled={loading} />
      </Form.Item>
      <Form.Item
        label="Situación Desfavorable"
        name="situacion_desfavorable"
        rules={[{ required: true, message: 'Por favor, ingrese la situación desfavorable' }]}
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
      <Form.Item
        label="Número de Identificación"
        name="numero_identificacion"
        rules={[{required: true, message: 'Por favor ingrese el número de identificación'}]}
      >
        <Input type="text" disabled={loading}/>
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
