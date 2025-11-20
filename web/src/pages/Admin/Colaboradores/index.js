import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    allColaboradores,
    addColaborador,
    saveColaborador,
    updateColaborador,
    unlinkColaborador,
    resetColaborador,
    allServicos,
} from '../../../store/slices/colaboradorSlice';
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

const FotoColaborador = ({ foto, nome }) => {
    const [imageError, setImageError] = useState(false);
    const fotoUrl = foto && foto.startsWith('http') ? foto : null;

    return (
        <div className="flex items-center justify-center w-full h-full py-2">
            {fotoUrl && !imageError ? (
                <div className="w-12 h-12 rounded-full border-2 border-gray-300 overflow-hidden bg-white flex items-center justify-center">
                    <img
                        src={fotoUrl}
                        alt={nome || 'Colaborador'}
                        className="w-full h-full object-contain"
                        style={{ objectPosition: 'center' }}
                        onError={() => setImageError(true)}
                    />
                </div>
            ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center text-gray-500 font-semibold">
                    {nome ? nome.charAt(0).toUpperCase() : '?'}
                </div>
            )}
        </div>
    );
};

const Colaboradores = () => {
    const dispatch = useDispatch();
    const { colaborador, colaboradores, servicos, form, components, behavior } = useSelector(
        (state) => state.colaborador
    );
    const fileInputRef = useRef(null);
    const [fotoPreview, setFotoPreview] = useState(null);
    const [fotoFile, setFotoFile] = useState(null); // Estado local para o File

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
            especialidades: colaborador.especialidades || [],
        };

        dispatch(updateColaborador({ colaborador: colaboradorFormatado }));

        if (behavior === 'create') {
            dispatch(addColaborador(fotoFile));
        } else {
            dispatch(saveColaborador(fotoFile));
        }
        
        setComponents('drawer', false);
    };

    const remove = () => {
        dispatch(unlinkColaborador());
        setComponents('confirmDelete', false);
    };

    const onRowClick = (colab) => {
        const especialidadesParaEdicao = (colab.especialidadesIds || colab.especialidades || []).map(id => String(id));
        const fotoUrl = colab.foto && colab.foto.startsWith('http') ? colab.foto : null;
        setFotoPreview(fotoUrl);
        dispatch(updateColaborador({ 
            colaborador: { ...colab, especialidades: especialidadesParaEdicao }, 
            behavior: 'update' 
        }));
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

            // Validar tamanho (5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('A imagem deve ter no máximo 5MB.');
                return;
            }

            // Criar preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setFotoPreview(reader.result);
            };
            reader.readAsDataURL(file);

            // Armazenar File no estado local (não no Redux)
            setFotoFile(file);
        }
    };

    const handleFotoClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemoveFoto = () => {
        setFotoPreview(null);
        setFotoFile(null);
        setColaborador('foto', '');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatarEspecialidades = (especialidades) => {
        if (!Array.isArray(especialidades) || especialidades.length === 0) {
            return 'Sem especialidades';
        }
        if (especialidades.length === 1) {
            return especialidades[0];
        }
        if (especialidades.length <= 2) {
            return especialidades.join(', ');
        }
        return `${especialidades.slice(0, 2).join(', ')} e +${especialidades.length - 2}`;
    };

    useEffect(() => {
        dispatch(allColaboradores());
        dispatch(allServicos());
    }, [dispatch]);

    return (
        <div className="p-5 md:p-20 h-full flex flex-col overflow-auto">
            <Toaster position="top-right" />

            <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-catamaran  font-semibold">Colaboradores</h2>
                <button
                    onClick={() => {
                        dispatch(resetColaborador());
                        dispatch(updateColaborador({ behavior: 'create' }));
                        setFotoPreview(null);
                        setFotoFile(null);
                        if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                        }
                        setComponents('drawer', true);
                    }}
                    className="bg-[#CDA327] text-white px-2 py-2 lg:px-5 lg:py-3 rounded-lg hover:bg-[#CDA327]/20 transition-all"
                >
                    Novo Colaborador
                </button>
            </div>

            <TableComponent
                data={colaboradores || []} 
                rows={colaboradores || []}
                loading={form.filtering}
                config={[
                    {
                        label: 'Foto',
                        key: 'foto',
                        width: 80,
                        content: (foto, rowData) => (
                            <FotoColaborador foto={foto} nome={rowData.nome} />
                        ),
                    },
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
                        content: (esp) => (
                            <div className="flex flex-wrap gap-1">
                                {Array.isArray(esp) && esp.length > 0 ? (
                                    esp.slice(0, 3).map((nome, index) => (
                                        <Tag key={index} color="cyan" size="sm">
                                            {nome}
                                        </Tag>
                                    ))
                                ) : (
                                    <span className="text-gray-400">Sem especialidades</span>
                                )}
                                {Array.isArray(esp) && esp.length > 3 && (
                                    <Tag color="gray" size="sm">
                                        +{esp.length - 3}
                                    </Tag>
                                )}
                            </div>
                        ),
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

            <Drawer
                open={components.drawer}
                size="sm"
                onClose={() => {
                    setComponents('drawer', false);
                    setFotoPreview(null);
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
                        {behavior === 'create' ? 'Novo Colaborador' : 'Editar Colaborador'}
                    </div>

                    {behavior !== 'create' && (
                        <Message type="info" showIcon>
                            Este colaborador já existe. Edite apenas as informações permitidas.
                        </Message>
                    )}

                    <div className="space-y-3 mt-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Foto do Colaborador
                            </label>
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-20 h-20 rounded-full border-2 border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#CDA327] transition-colors overflow-hidden bg-gray-100"
                                    onClick={handleFotoClick}
                                >
                                    {fotoPreview ? (
                                        <img
                                            src={fotoPreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-gray-400 text-2xl">📷</span>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button
                                        type="button"
                                        onClick={handleFotoClick}
                                        className="text-sm text-[#CDA327] hover:text-[#CDA327]/80 underline"
                                    >
                                        {fotoPreview ? 'Alterar foto' : 'Selecionar foto'}
                                    </button>
                                    {fotoPreview && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveFoto}
                                            className="text-sm text-red-500 hover:text-red-700 underline"
                                        >
                                            Remover foto
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
                            value={colaborador.dataNascimento ? colaborador.dataNascimento.split('T')[0] : ''}
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

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Especialidades (Serviços)
                            </label>
                            <select
                                multiple
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#CDA327]"
                                value={(colaborador.especialidades || []).map(id => String(id))}
                                onChange={(e) => {
                                    const selectedOptions = Array.from(e.target.selectedOptions);
                                    const values = selectedOptions.map(option => option.value);
                                    setColaborador('especialidades', values);
                                }}
                                style={{ 
                                    minHeight: '120px',
                                    maxHeight: '200px',
                                    overflowY: 'auto'
                                }}
                            >
                                {servicos && servicos.length > 0 ? (
                                    servicos.map((serv) => {
                                        if (!serv) return null; // Proteção contra valores nulos
                                        const servId = String(serv.value || serv._id || '');
                                                const servNome = serv.label || serv.nomeServico || 'Serviço sem nome';
                                        if (!servId) return null;
                                        return (
                                            <option key={servId} value={servId}>
                                                {servNome}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option disabled>Nenhum serviço disponível</option>
                                )}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Mantenha Ctrl (Windows) ou Cmd (Mac) pressionado para selecionar múltiplos serviços
                            </p>
                            {colaborador.especialidades && colaborador.especialidades.length > 0 && (
                                <p className="text-xs text-green-600 mt-1">
                                    {colaborador.especialidades.length} especialidade(s) selecionada(s)
                                </p>
                            )}
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
