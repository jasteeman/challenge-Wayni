import { useState, useCallback } from 'react';
import { Button, Card, Spin, Alert, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { importData } from '../services/dataImportService';

export const HomePage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (info: any) => {
    if (Array.isArray(info.fileList)) {
      setFile(info.fileList[0]?.originFileObj || null);
    } else {
      setFile(info.fileList?.originFileObj || null);
    }
  };

  const handleUpload = useCallback(async () => {
    if (!file) {
      message.error('Por favor, selecciona un archivo para subir.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
     await importData(file);
      message.success('Importación de datos completada con éxito.');
    } catch (err: any) {
      setError(err.message || 'Error al subir el archivo e iniciar la importación');
      message.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [file]);

  const uploadProps = {
    name: 'archivo',
    onChange: handleFileChange,
    maxCount: 1,
    beforeUpload: (file: File) => {
      console.log("Archivo seleccionado:", file); // Para debug
      return true;
    },
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Importar Datos</h1>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          className="mb-4"
        />
      )}

      <Card>
        <div className="mb-4">
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>Seleccionar Archivo</Button>
          </Upload>
        </div>
        <Button onClick={handleUpload} loading={loading} disabled={loading}>
          {loading ? 'Importando...' : 'Importar Datos'}
        </Button>
      </Card>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      )}
    </div>
  );
};

export default HomePage;
