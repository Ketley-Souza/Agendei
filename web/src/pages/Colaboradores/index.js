import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    allColaboradores,
    addColaborador,
    saveColaborador,
    updateColaborador,
    unlinkColaborador,
    resetColaborador,
    allServicos,
} from '../../store/slices/colaboradorSlice';
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

const Colaboradores = () => {
    const dispatch = useDispatch();
    const { colaborador, colaboradores, servicos, form, components, behavior } = useSelector(
        (state) => state.colaborador
    );

    // === Funções utilitárias ===
    const limparTelefone = (value) => value.replace(/\D/g, '');

    const formatarTelefone = (value) => {
        const numeros = limparTelefone(value);
        return numeros.length === 11
            ? numeros.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
            : numeros;
    };

    const setColaborador = (key, value) => {
        const novoValor = key === 'telefone' ? limparTelefone(value) : value;
        dispatch(
            updateColaborador({
                colaborador: { ...colaborador, [key]: novoValor },
            })
        );
    };

    const setComponents = (key, value) => {
        dispatch(
            updateColaborador({
                components: { ...components, [key]: value },
            })
        );
    };

    const save = () => {
        if (
            !util.allFields(colaborador, [
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

        const colaboradorFormatado = {
            ...colaborador,
            telefone: limparTelefone(colaborador.telefone),
        };

        dispatch(updateColaborador({ colaborador: colaboradorFormatado }));

        if (behavior === 'create') {
            dispatch(addColaborador());
        } else {
            dispatch(saveColaborador());
        }
        
        setComponents('drawer', false);
    };

    const remove = () => {
        dispatch(unlinkColaborador());
        setComponents('confirmDelete', false);
    };

    const onRowClick = (colab) => {
        dispatch(updateColaborador({ colaborador: colab, behavior: 'update' }));
        setComponents('drawer', true);
    };

    const formatarEspecialidades = (especialidades) => {
        if (!Array.isArray(especialidades) || especialidades.length === 0) {
            return 'Sem especialidades';
        }
        return especialidades.length === 1
            ? especialidades[0]
            : `${especialidades.length} especialidades`;
    };

    useEffect(() => {
        dispatch(allColaboradores());
        dispatch(allServicos());
    }, [dispatch]);

    return (
        <div className="p-5 md:p-20 h-full flex flex-col overflow-auto">
            <Toaster position="top-right" />

            {/* Cabeçalho */}
            <div className="flex justify-between items-center mb-10">
                <h2 className="font-mono text-2xl font-semibold">Colaboradores</h2>
                <button
                    onClick={() => {
                        dispatch(resetColaborador());
                        dispatch(updateColaborador({ behavior: 'create' }));
                        setComponents('drawer', true);
                    }}
                    className="bg-[#CDA327] text-white px-2 py-2 lg:px-5 lg:py-3 rounded-lg hover:bg-[#CDA327]/20 transition-all"
                >
                    Novo Colaborador
                </button>
            </div>

            {/* Tabela */}
            <TableComponent
                data={colaboradores || []} 
                rows={colaboradores || []}
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
                        label: 'Especialidades',
                        key: 'especialidades',
                        content: (esp) => formatarEspecialidades(esp),
                    },
                    {
                        label: 'Vínculo',
                        key: 'vinculo',
                        content: (vinculo) => (
                            <Tag color={vinculo === 'Disponivel' ? 'green' : 'red'}>
                                {vinculo}
                            </Tag>
                        ),
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
                        {behavior === 'create' ? 'Novo Colaborador' : 'Editar Colaborador'}
                    </div>

                    {behavior !== 'create' && (
                        <Message type="info" showIcon>
                            Este colaborador já existe. Edite apenas as informações permitidas.
                        </Message>
                    )}

                    <div className="space-y-3 mt-4">
                        <input
                            type="email"
                            placeholder="Email"
                            className="rs-input w-full"
                            value={colaborador.email}
                            onChange={(e) => setColaborador('email', e.target.value)}
                            disabled={behavior !== 'create'}
                        />
                        <input
                            type="text"
                            placeholder="Nome"
                            className="rs-input w-full"
                            value={colaborador.nome}
                            onChange={(e) => setColaborador('nome', e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Telefone"
                            className="rs-input w-full"
                            value={formatarTelefone(colaborador.telefone)}
                            onChange={(e) => setColaborador('telefone', e.target.value)}
                        />
                        <input
                            type="date"
                            className="rs-input w-full"
                            value={colaborador.dataNascimento}
                            onChange={(e) => setColaborador('dataNascimento', e.target.value)}
                        />
                        <select
                            className="rs-input w-full"
                            value={colaborador.sexo}
                            onChange={(e) => setColaborador('sexo', e.target.value)}
                        >
                            <option value="">Selecione o sexo</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Feminino">Feminino</option>
                        </select>

                        {/* Especialidades */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Especialidades (Serviços)
                            </label>
                            <select
                                multiple
                                className="rs-input w-full"
                                value={colaborador.especialidades || []}
                                onChange={(e) => {
                                    const values = Array.from(e.target.selectedOptions, o => o.value);
                                    setColaborador('especialidades', values);
                                }}
                                style={{ minHeight: '100px' }}
                            >
                                {(servicos || []).map((serv) => (
                                    <option key={serv.value || serv._id} value={serv.value || serv._id}>
                                        {serv.label || serv.nomeServico}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Mantenha Ctrl/Cmd pressionado para selecionar múltiplos
                            </p>
                        </div>

                        {behavior === 'create' && (
                            <input
                                type="password"
                                placeholder="Senha"
                                className="rs-input w-full"
                                value={colaborador.senha || ''}
                                onChange={(e) => setColaborador('senha', e.target.value)}
                            />
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
                        {behavior === 'create' ? 'Salvar' : 'Atualizar'} Colaborador
                    </Button>

                    {behavior !== 'create' && (
                        <Button
                            appearance="ghost"
                            color="red"
                            block
                            className="mt-2"
                            onClick={() => setComponents('confirmDelete', true)}
                        >
                            Desvincular Colaborador
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
                    <Modal.Title>Confirmar desvinculação</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Tem certeza que deseja desvincular este colaborador? Essa ação não pode ser desfeita.
                </Modal.Body>
                <Modal.Footer className="flex justify-end gap-2">
                    <button
                        onClick={remove}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                        disabled={form.saving}
                    >
                        Sim, desvincular
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

export default Colaboradores;
