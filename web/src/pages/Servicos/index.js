import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    allServicos,
    addServico,
    saveServico,
    updateServico,
    deleteServico,
    resetServico,
} from '../../store/slices/servicoSlice';
import util from '../../services/util';
import TableComponent from '../../components/Table';
import {
    Drawer,
    Modal,
    Button,
    Message,
    Tag,
} from 'rsuite';
import { toast, Toaster } from 'react-hot-toast';

// Componente para exibir imagem do serviço
const ImagemServico = ({ imagem, nome }) => {
    const [imageError, setImageError] = useState(false);
    const imagemUrl = imagem
        ? imagem.startsWith('http') || imagem.startsWith('/uploads')
            ? imagem.startsWith('http')
                ? imagem
                : `${util.baseURL}${imagem}`
            : imagem
        : null;

    return (
        <div className="flex items-center justify-center w-full h-full py-2">
            {imagemUrl && !imageError ? (
                <div className="w-16 h-16 rounded-lg border-2 border-gray-300 overflow-hidden bg-white flex items-center justify-center">
                    <img
                        src={imagemUrl}
                        alt={nome || 'Serviço'}
                        className="w-full h-full object-contain"
                        style={{ objectPosition: 'center' }}
                        onError={() => setImageError(true)}
                    />
                </div>
            ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-200 border-2 border-gray-300 flex items-center justify-center text-gray-400 text-2xl">
                    🖼️
                </div>
            )}
        </div>
    );
};

const Servicos = () => {
    const dispatch = useDispatch();
    const { servico, servicos, form, components, behavior } = useSelector(
        (state) => state.servico
    );
    const fileInputRef = useRef(null);
    const [imagemPreview, setImagemPreview] = useState(null);

    const setServico = (key, value) => {
        dispatch(
            updateServico({
                servico: { ...servico, [key]: value },
            })
        );
    };

    const setComponents = (key, value) => {
        dispatch(
            updateServico({
                components: { ...components, [key]: value },
            })
        );
    };

    const formatarPreco = (valor) => {
        if (!valor) return 'R$ 0,00';
        const num = typeof valor === 'string' ? parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.')) : valor;
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(num);
    };

    const handlePrecoChange = (value) => {
        //Padronização
        const apenasNumeros = value.replace(/[^\d,]/g, '');
        setServico('preco', apenasNumeros);
    };

    const save = () => {
        if (
            !util.allFields(servico, [
                'nomeServico',
                'preco',
                'duracao',
                'descricao',
            ])
        ) {
            toast.error('Preencha todos os campos obrigatórios antes de salvar!');
            return;
        }

        // Validar preço
        const precoNum = parseFloat(servico.preco.toString().replace(',', '.'));
        if (isNaN(precoNum) || precoNum <= 0) {
            toast.error('Preço inválido!');
            return;
        }

        const servicoFormatado = {
            ...servico,
            preco: precoNum.toString().replace('.', ','),
        };

        dispatch(updateServico({ servico: servicoFormatado }));

        if (behavior === 'create') {
            dispatch(addServico());
        } else {
            dispatch(saveServico());
        }

        setComponents('drawer', false);
    };

    const remove = () => {
        dispatch(deleteServico());
        setComponents('confirmDelete', false);
    };

    const onRowClick = (serv) => {
        const imagemUrl = serv.imagem
            ? serv.imagem.startsWith('http') || serv.imagem.startsWith('/uploads')
                ? serv.imagem.startsWith('http')
                    ? serv.imagem
                    : `${util.baseURL}${serv.imagem}`
                : serv.imagem
            : null;
        setImagemPreview(imagemUrl);
        dispatch(updateServico({ servico: serv, behavior: 'update' }));
        setComponents('drawer', true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar tipo de arquivo
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                toast.error('Apenas imagens (JPEG, JPG, PNG, WEBP) são permitidas.');
                return;
            }

            // Validar tamanho 
            if (file.size > 5 * 1024 * 1024) {
                toast.error('A imagem deve ter no máximo 5MB.');
                return;
            }

            // Criar preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagemPreview(reader.result);
            };
            reader.readAsDataURL(file);

            // Armazenar o arquivo
            setServico('imagemFile', file);
        }
    };

    const handleImagemClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemoveImagem = () => {
        setImagemPreview(null);
        setServico('imagemFile', null);
        setServico('imagem', '');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    useEffect(() => {
        dispatch(allServicos());
    }, [dispatch]);

    return (
        <div className="p-5 md:p-20 h-full flex flex-col overflow-auto">
            <Toaster position="top-right" />

            {/* Cabeçalho */}
            <div className="flex justify-between items-center mb-10">
                <h2 className="font-mono text-2xl font-semibold">Serviços</h2>
                <button
                    onClick={() => {
                        dispatch(resetServico());
                        dispatch(updateServico({ behavior: 'create' }));
                        setImagemPreview(null);
                        if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                        }
                        setComponents('drawer', true);
                    }}
                    className="bg-[#CDA327] text-white px-2 py-2 lg:px-5 lg:py-3 rounded-lg hover:bg-[#CDA327]/20 transition-all"
                >
                    Novo Serviço
                </button>
            </div>

            {/* Tabela */}
            <TableComponent
                data={servicos || []}
                rows={servicos || []}
                loading={form.filtering}
                config={[
                    {
                        label: 'Imagem',
                        key: 'imagem',
                        width: 100,
                        content: (imagem, rowData) => (
                            <ImagemServico imagem={imagem} nome={rowData.nomeServico} />
                        ),
                    },
                    { label: 'Nome do Serviço', key: 'nomeServico' },
                    {
                        label: 'Preço',
                        key: 'preco',
                        content: (preco) => formatarPreco(preco),
                    },
                    { label: 'Duração', key: 'duracao' },
                    {
                        label: 'Status',
                        key: 'status',
                        content: (status) => (
                            <Tag color={status === 'Disponivel' ? 'green' : 'red'}>
                                {status}
                            </Tag>
                        ),
                    },
                ]}
                onRowClick={onRowClick}
            />

            {/* Drawer */}
            <Drawer
                open={components.drawer}
                size="md"
                onClose={() => {
                    setComponents('drawer', false);
                    setImagemPreview(null);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                }}
            >
                <Drawer.Header className="border-b border-gray-200">
                    <Drawer.Title className="opacity-0 select-none">Placeholder</Drawer.Title>
                </Drawer.Header>

                <Drawer.Body>
                    <div className="font-medium text-center text-xl mb-6">
                        {behavior === 'create' ? 'Novo Serviço' : 'Editar Serviço'}
                    </div>

                    {behavior !== 'create' && (
                        <Message type="info" showIcon>
                            Edite as informações do serviço abaixo.
                        </Message>
                    )}

                    <div className="space-y-3 mt-4">
                        {/* Campo de Upload de Imagem */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Imagem do Serviço
                            </label>
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-24 h-24 rounded-lg border-2 border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#CDA327] transition-colors overflow-hidden bg-gray-100"
                                    onClick={handleImagemClick}
                                >
                                    {imagemPreview ? (
                                        <img
                                            src={imagemPreview}
                                            alt="Preview"
                                            className="w-full h-full object-contain bg-white"
                                        />
                                    ) : (
                                        <span className="text-gray-400 text-3xl">🖼️</span>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button
                                        type="button"
                                        onClick={handleImagemClick}
                                        className="text-sm text-[#CDA327] hover:text-[#CDA327]/80 underline"
                                    >
                                        {imagemPreview ? 'Alterar imagem' : 'Selecionar imagem'}
                                    </button>
                                    {imagemPreview && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveImagem}
                                            className="text-sm text-red-500 hover:text-red-700 underline"
                                        >
                                            Remover imagem
                                        </button>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Formatos aceitos: JPEG, JPG, PNG, WEBP (máx. 5MB)
                            </p>
                        </div>

                        <input
                            type="text"
                            placeholder="Nome do Serviço *"
                            className="rs-input w-full"
                            value={servico.nomeServico || ''}
                            onChange={(e) => setServico('nomeServico', e.target.value)}
                        />

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Preço *
                            </label>
                            <input
                                type="text"
                                placeholder="0,00"
                                className="rs-input w-full"
                                value={servico.preco || ''}
                                onChange={(e) => handlePrecoChange(e.target.value)}
                            />
                            {servico.preco && (
                                <p className="text-xs text-gray-500 mt-1">
                                    {formatarPreco(servico.preco)}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Duração *
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: 30 min, 1h, 1h30min"
                                className="rs-input w-full"
                                value={servico.duracao || ''}
                                onChange={(e) => setServico('duracao', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Descrição *
                            </label>
                            <textarea
                                placeholder="Descreva o serviço..."
                                className="rs-input w-full"
                                rows={4}
                                value={servico.descricao || ''}
                                onChange={(e) => setServico('descricao', e.target.value)}
                            />
                        </div>

                        {behavior !== 'create' && (
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Status
                                </label>
                                <select
                                    className="rs-input w-full"
                                    value={servico.status || 'Disponivel'}
                                    onChange={(e) => setServico('status', e.target.value)}
                                >
                                    <option value="Disponivel">Disponível</option>
                                    <option value="Indisponivel">Indisponível</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <Button
                        appearance={behavior === 'create' ? 'primary' : 'default'}
                        color={behavior === 'create' ? 'green' : 'blue'}
                        block
                        className="mt-5"
                        loading={form.saving}
                        onClick={save}
                    >
                        {behavior === 'create' ? 'Salvar' : 'Atualizar'} Serviço
                    </Button>

                    {behavior !== 'create' && (
                        <Button
                            appearance="ghost"
                            color="red"
                            block
                            className="mt-2"
                            onClick={() => setComponents('confirmDelete', true)}
                        >
                            Excluir Serviço
                        </Button>
                    )}
                </Drawer.Body>
            </Drawer>

            {/* Modal de confirmação */}
            <Modal
                open={components.confirmDelete}
                onClose={() => setComponents('confirmDelete', false)}
                size="xs"
            >
                <Modal.Header>
                    <Modal.Title>Confirmar exclusão</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Tem certeza que deseja excluir este serviço? Essa ação não pode ser desfeita.
                </Modal.Body>
                <Modal.Footer className="flex justify-end gap-2">
                    <button
                        onClick={remove}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                        disabled={form.saving}
                    >
                        Sim, excluir
                    </button>
                    <button
                        onClick={() => setComponents('confirmDelete', false)}
                        className="bg-gray-100/80 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
                    >
                        Cancelar
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Servicos;
