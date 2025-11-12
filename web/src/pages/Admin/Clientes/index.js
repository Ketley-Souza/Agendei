import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    allClientes,
    addCliente,
    updateCliente,
    unlinkCliente,
    resetCliente,
} from '../../../store/slices/clienteSlice';
import util from '../../../services/util';
import TableComponent from '../../../components/Table';
import {
    Drawer,
    Modal,
    Button,
    Message,
    Tag,
} from 'rsuite';
import { toast, Toaster } from 'react-hot-toast';

const Clientes = () => {
    const dispatch = useDispatch();
    const { cliente, clientes, form, components, behavior } = useSelector(
        (state) => state.cliente
    );

    // === Funções utilitárias ===
    const limparTelefone = (value) => value.replace(/\D/g, '');

    const formatarTelefone = (value) => {
        const numeros = limparTelefone(value);
        return numeros.length === 11
            ? numeros.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
            : numeros;
    };

    const setCliente = (key, value) => {
        const novoValor = key === 'telefone' ? limparTelefone(value) : value;
        dispatch(
            updateCliente({
                cliente: { ...cliente, [key]: novoValor },
            })
        );
    };

    const setComponents = (key, value) => {
        dispatch(
            updateCliente({
                components: { ...components, [key]: value },
            })
        );
    };

    const save = () => {
        if (
            !util.allFields(cliente, [
                'email',
                'nome',
                'telefone',
                'dataNascimento',
                'sexo',
                'senha',
            ])
        ) {
            toast.error('Preencha todos os campos obrigatórios antes de salvar!');
            return;
        }

        const clienteFormatado = {
            ...cliente,
            telefone: limparTelefone(cliente.telefone),
        };

        dispatch(updateCliente({ cliente: clienteFormatado }));
        dispatch(addCliente());
        setComponents('drawer', false);
    };

    const remove = () => {
        dispatch(unlinkCliente());
        setComponents('confirmDelete', false);
    };

    const onRowClick = (cliente) => {
        dispatch(updateCliente({ cliente, behavior: 'update' }));
        setComponents('drawer', true);
    };

    useEffect(() => {
        dispatch(allClientes());
    }, [dispatch]);

    return (
        <div className="p-5 md:p-20 h-full flex flex-col overflow-auto">
            <Toaster position="top-right" />

            {/* Cabeçalho */}
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-catamaran font-semibold">Clientes</h2>
                <button
                    onClick={() => {
                        dispatch(resetCliente());
                        dispatch(updateCliente({ behavior: 'create' }));
                        setComponents('drawer', true);
                    }}
                    className="bg-[#CDA327] text-white px-2 py-2 lg:px-5 lg:py-3 rounded-lg hover:bg-[#CDA327]/20 transition-all"
                >
                    Novo Cliente
                </button>
            </div>

            {/* Tabela */}
            <TableComponent
                data={clientes || []} 
                rows={clientes || []}
                loading={form.filtering}
                config={[
                    { label: 'Nome', key: 'nome' },
                    { label: 'Email', key: 'email' },
                    {
                        label: 'Telefone',
                        key: 'telefone',
                        content: (tel) => formatarTelefone(tel),
                    },
                    {
                        label: 'Sexo',
                        key: 'sexo',
                        content: (sexo) => <Tag color="gray">{sexo}</Tag>,
                    },
                    { label: 'Data de Cadastro', key: 'dataCadastro' },
                ]}
                onRowClick={onRowClick}
            />

            {/* Drawer */}
            <Drawer
                open={components.drawer}
                size="sm"
                onClose={() => setComponents('drawer', false)}
            >
                <Drawer.Header className="border-b border-gray-200">
                    <Drawer.Title className="opacity-0 select-none">Placeholder</Drawer.Title>
                </Drawer.Header>

                <Drawer.Body>
                    <div className="font-medium text-center text-xl mb-6">
                        {behavior === 'create' ? 'Novo Cliente' : 'Editar Cliente'}
                    </div>

                    {behavior !== 'create' && (
                        <Message type="info" showIcon>
                            Este cliente já existe. Edite apenas as informações permitidas.
                        </Message>
                    )}

                    <div className="space-y-3 mt-4">
                        <input
                            type="email"
                            placeholder="Email"
                            className="rs-input w-full"
                            value={cliente.email}
                            onChange={(e) => setCliente('email', e.target.value)}
                            disabled={behavior !== 'create'}
                        />
                        <input
                            type="text"
                            placeholder="Nome"
                            className="rs-input w-full"
                            value={cliente.nome}
                            onChange={(e) => setCliente('nome', e.target.value)}
                            disabled={behavior !== 'create'}
                        />
                        <input
                            type="text"
                            placeholder="Telefone"
                            className="rs-input w-full"
                            value={formatarTelefone(cliente.telefone)}
                            onChange={(e) => setCliente('telefone', e.target.value)}
                            disabled={behavior !== 'create'}
                        />
                        <input
                            type="date"
                            className="rs-input w-full"
                            value={cliente.dataNascimento}
                            onChange={(e) => setCliente('dataNascimento', e.target.value)}
                            disabled={behavior !== 'create'}
                        />
                        <select
                            className="rs-input w-full"
                            value={cliente.sexo}
                            disabled={behavior !== 'create'}
                            onChange={(e) => setCliente('sexo', e.target.value)}
                        >
                            <option value="">Selecione o sexo</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Feminino">Feminino</option>
                        </select>

                        {behavior === 'create' && (
                            <input
                                type="password"
                                placeholder="Senha"
                                className="rs-input w-full"
                                value={cliente.senha || ''}
                                onChange={(e) => setCliente('senha', e.target.value)}
                            />
                        )}
                    </div>

                    <Button
                        appearance={behavior === 'create' ? 'primary' : 'ghost'}
                        color={behavior === 'create' ? 'green' : 'red'}
                        block
                        className="mt-5"
                        loading={form.saving}
                        onClick={() => {
                            if (behavior === 'create') save();
                            else setComponents('confirmDelete', true);
                        }}
                    >
                        {behavior === 'create' ? 'Salvar' : 'Remover'} Cliente
                    </Button>
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
                    Tem certeza que deseja excluir este cliente? Essa ação não pode ser desfeita.
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

export default Clientes;