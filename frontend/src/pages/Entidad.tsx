import { useState, useEffect, useCallback } from 'react';
import { Button, message, Modal, Table } from 'antd';
import Search from 'antd/es/input/Search';
import { ColumnsType, TableProps } from 'antd/lib/table';
import { Entidad } from '../interfaces/IEntidad'; // Ajusta la ruta
import { SortOrder } from 'antd/lib/table/interface';
import debounce from 'lodash/debounce';
import { GetProp } from 'antd/lib';
import { getList, remove, saveOrUpdate } from '../services/entidadService';
import { useNavigate } from 'react-router-dom';
import { EntidadForm } from '../components/entidad/EntidadForm';

type TablePaginationConfig = Exclude<GetProp<TableProps, "pagination">, boolean>;

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: string;
  sortOrder?: SortOrder;
}

export const GestionEntidades = () => {
  const [data, setData] = useState<Entidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [_, setError] = useState<any>(null);
  const [searchText, setSearchText] = useState<string | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntidad, setEditingEntidad] = useState<Entidad | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedEntidadId, setSelectedEntidadId] = useState<string | null>(null);
  const navigate = useNavigate();

  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    sortField: undefined,
    sortOrder: undefined,
  });

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const limit = tableParams!.pagination!.pageSize!;
      const page = tableParams!.pagination!.current!;
      const params: Record<string, string | number | boolean | undefined> = {
        page: page,
        limit: limit,
        q: searchText,
        sortField: tableParams.sortField,
        sortOrder: tableParams.sortOrder === "ascend" ? "asc" : tableParams.sortOrder === "descend" ? "desc" : undefined,
      };
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined && v !== '')
      );
      const parsedQueryString = new URLSearchParams();
      for (const key in filteredParams) {
        if (filteredParams.hasOwnProperty(key) && filteredParams[key] !== undefined) {
          parsedQueryString.append(key, String(filteredParams[key]));
        }
      }
      const queryString = parsedQueryString.toString();
      const data = await getList(queryString);
      if (data) {
        setData(data.rows);
        setTableParams({
          ...tableParams,
          pagination: {
            ...tableParams.pagination,
            total: data.count,
          },
        });
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [searchText, tableParams.pagination?.pageSize, tableParams.pagination?.current, tableParams.sortField, tableParams.sortOrder]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const debouncedSearch = useCallback(debounce((text: string) => {
    setSearchText(text);
  }, 300), []);

  const onSearch = (text: string) => {
    debouncedSearch(text);
  };

  const handleTableChange: TableProps<Entidad>["onChange"] = (pagination, _filters, sorter) => {
    let sortField: string | undefined = undefined;
    let sortOrder: SortOrder | undefined = undefined;
    if (Array.isArray(sorter)) {
      if (sorter.length > 0) {
        sortField = sorter[0].field as string | undefined;
        sortOrder = sorter[0].order;
      }
    } else {
      sortField = sorter.field as string | undefined;
      if (sorter && sorter.order && (sorter.order === "ascend" || sorter.order === "descend")) {
        sortOrder = sorter.order;
      }
    }
    setTableParams({
      ...tableParams,
      pagination,
      sortField,
      sortOrder,
    });
    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setData([]);
    }
  };

  const handleCreateEdit = useCallback((entidad?: Entidad) => {
    setEditingEntidad(entidad || null);
    setIsModalOpen(true);
  }, []);

  const handleFormSubmit = useCallback(async (values: Omit<Entidad, 'id'>) => {
    setFormLoading(true);
    try {
      if (editingEntidad?._id) {
        await saveOrUpdate(values);
        message.success("Entidad actualizada exitosamente");
      } else {
        await saveOrUpdate(values);
        message.success("Entidad creada exitosamente");
      }
      await fetchList();
      setIsModalOpen(false);
      setEditingEntidad(null);
    } catch (error: any) {
      alert(error.message || "Error al guardar la entidad");
    } finally {
      setFormLoading(false);
    }
  }, [editingEntidad?._id, fetchList]);

  const handleCancelModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingEntidad(null);
  }, []);

  const handleRemove = useCallback(async (entidad: Entidad) => {
    Modal.confirm({
      title: "¿Estás seguro de eliminar esta entidad?",
      content: `ID: ${entidad._id}, Código: ${entidad.codigo_entidad}`,
      onOk: async () => {
        const deleted = await remove(entidad._id!);
        if (deleted) {
          message.success("Entidad eliminada exitosamente");
          await fetchList();
        } else {
          message.error("Error al eliminar la entidad");
        }
      },
    });
  }, [fetchList]);

  const handleVerDeudores = (idEntidad: string) => {
    setSelectedEntidadId(idEntidad);
    navigate(`/entidades/deudores/${idEntidad}`);
    console.log(`Ver deudores de la entidad con ID: ${idEntidad}`);
  };

  const getColumns = useCallback((): ColumnsType<Entidad> => [
    {
      title: "ID",
      dataIndex: "_id",
      width: "20%",
      responsive: ["md", "sm", "xs"]
    },
    {
      title: "Código de Entidad",
      dataIndex: "codigo_entidad",
      width: "35%",
      responsive: ["md", "sm", "xs"]
    },
    {
      title: "Suma de Préstamos",
      dataIndex: "suma_prestamos",
      width: "25%",
      responsive: ["md", "sm", "xs"],
      render: (suma_prestamos: number) => `$${suma_prestamos.toFixed(2)}`,
    },
    {
      title: "Acciones",
      dataIndex: "actions",
      width: "20%",
      align: "center",
      render: (_, record: Entidad) => (
        <>
          <Button type="link" onClick={() => handleCreateEdit(record)}>
            Editar
          </Button>
          <Button type="link" danger onClick={() => handleRemove(record)}>
            Eliminar
          </Button>
          <Button type="link" onClick={() => handleVerDeudores(record._id?.toString() ?? "")}>
            Ver Deudores
          </Button>
        </>
      ),
    },
  ], [handleCreateEdit, handleRemove, handleVerDeudores]);

  return (
    <>
      <div className="mb-3 flex items-center">
        <Search
          placeholder="Buscar por ID o Código de Entidad"
          allowClear
          onSearch={onSearch}
          className="w-1/4 mr-1"
        />
        <div className="mr-2">{tableParams.pagination?.total} resultados</div>
        <div className="ml-auto">
          <Button type="primary" onClick={() => handleCreateEdit()}>
            Nueva Entidad
          </Button>
        </div>
      </div>
      <Table
        columns={getColumns()}
        loading={loading}
        dataSource={data}
        pagination={tableParams.pagination}
        onChange={handleTableChange}
        rowKey="_id"
      />
      <Modal
        title={editingEntidad ? `Editar Entidad ${selectedEntidadId ?? ""}` : "Nueva Entidad"}
        open={isModalOpen}
        onCancel={handleCancelModal}
        footer={null}
      >
        <EntidadForm
          initialValues={editingEntidad || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleCancelModal}
          loading={formLoading}
        />
      </Modal>
    </>
  );
};

export default GestionEntidades;
