import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert, Button, message, Modal, Spin, Table, } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import {
    saveOrUpdate,
    remove,
    getList
} from '../services/deudorService';
import { ColumnsType } from 'antd/lib/table';
import { Deudor } from '../interfaces/IDeudor';
import { useParams, useNavigate } from 'react-router-dom';
import { DeudorForm } from '../components/deudor/deudorForm';
import { GetProp, TableProps } from 'antd/lib';
import { SortOrder } from 'antd/es/table/interface';
import { debounce } from 'lodash';
import Search from 'antd/es/input/Search';

type TablePaginationConfig = Exclude<GetProp<TableProps, "pagination">, boolean>;

interface TableParams {
    pagination?: TablePaginationConfig;
    sortField?: string;
    sortOrder?: SortOrder;
}


const formatCUIT = (cuit: string): string => {
    if (!cuit || cuit.length !== 11) {
        return cuit;
    }
    return `${cuit.slice(0, 2)}-${cuit.slice(2, 10)}-${cuit.slice(10)}`;
};

export const DeudorPage = () => {
    const { id } = useParams();
    const [data, setData] = useState<Deudor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDeudor, setEditingDeudor] = useState<Deudor | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState<string | undefined>(undefined);

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
            const data = await getList(id || '', queryString);
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
            setError(err instanceof Error ? err.message : String(err));
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

    const handleTableChange: TableProps<Deudor>["onChange"] = (pagination, _filters, sorter) => {
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

    const handleCreateEdit = useCallback((deudor?: Deudor) => {
        setEditingDeudor(deudor || null);
        setIsModalOpen(true);
    }, []);

    const handleRemove = useCallback(async (deudor: Deudor) => {
        Modal.confirm({
            title: "¿Estás seguro de eliminar este registro?",
            content: `N° de identificación: ${formatCUIT(deudor.numero_identificacion.toString())} | Suma de prestamos: $ ${deudor.suma_prestamos.toFixed(2)}`,
            onOk: async () => {
                try {
                    if (deudor._id) {
                        const deleted = await remove(deudor._id);
                        if (deleted) {
                            message.success("deudor eliminada exitosamente");
                            await fetchList();
                        } else {
                            message.error("Error al eliminar la deudor");
                        }
                    }
                } catch (error) {
                    message.error("Error al eliminar la deudor");
                }

            },
        });
    }, [fetchList]);

    const columns = useMemo<ColumnsType<Deudor>>(() => [
        {
            title: "N° de Identificación",
            dataIndex: "numero_identificacion",
            width: "20%",
            render: (numero_identificacion: string) => formatCUIT(numero_identificacion.toString()),
        },
        {
            title: "Situación Desfavorable",
            dataIndex: "situacion_desfavorable",
            width: "30%",
        },
        {
            title: "Suma Prestamos",
            dataIndex: "suma_prestamos",
            width: "30%",
            render: (suma_prestamos: number) => `$${suma_prestamos}`,
        },
        {
            title: "Acciones",
            dataIndex: "actions",
            width: "20%",
            align: "center",
            render: (_, record: Deudor) => (
                <>
                    <Button type="link" onClick={() => handleCreateEdit(record)}>
                        Editar
                    </Button>
                    <Button type="link" danger onClick={() => handleRemove(record)}>
                        Eliminar
                    </Button>
                </>
            ),
        },
    ], [handleCreateEdit, handleRemove]);

    const handleFormSubmit = useCallback(async (values: Omit<Deudor, 'id'> & { idDeudor: string }) => {
        setFormLoading(true);
        try {
            if (editingDeudor?._id) {
                const updated = await saveOrUpdate({ ...values, codigo_entidad: id?.toString() });
                if (updated) {
                    message.success("Registro actualizado exitosamente");
                }
            } else {
                const created = await saveOrUpdate({ ...values, codigo_entidad: id?.toString() });
                if (created) {
                    message.success("Registro creado exitosamente");
                }
            }
            await fetchList();
            setIsModalOpen(false);
            setEditingDeudor(null);
        } catch (error: any) {
            alert(error.message || "Error al guardar la deudor");
        } finally {
            setFormLoading(false);
        }
    }, [editingDeudor?._id, fetchList]);

    const handleCancelModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingDeudor(null);
    }, []);



    const handleVolverAEntidades = () => {
        navigate('/entidades');
    };



    return (
        <div className="p-4">
            <div className="mb-4">
                <Button onClick={handleVolverAEntidades} icon={<ArrowLeftOutlined />}>
                    Volver a Entidades
                </Button>
                <h1 className="text-2xl font-semibold ml-4 inline-block">Entidad (ID: {id})</h1>
            </div>

            {error && (
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    className="mb-4"
                />
            )}

            {loading ? (
                <Spin size="large" />
            ) : (
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
                                Nueva Deuda
                            </Button>
                        </div>
                    </div>
                    <Table
                        columns={columns}
                        loading={loading}
                        dataSource={data}
                        pagination={tableParams.pagination}
                        onChange={handleTableChange}
                        rowKey="_id"
                    />
                    <Modal
                        title={editingDeudor ? "Editar Deudor" : "Nuevo Deudor"}
                        open={isModalOpen}
                        onCancel={handleCancelModal}
                        footer={null}
                    >
                        <DeudorForm
                            initialValues={editingDeudor || undefined}
                            onSubmit={handleFormSubmit}
                            onCancel={handleCancelModal}
                            loading={formLoading}
                        />
                    </Modal>
                </>
            )}
        </div>
    );
};

export default DeudorPage;
