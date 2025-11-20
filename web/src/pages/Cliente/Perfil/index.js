import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
    UserCircle, 
    EnvelopeSimple, 
    Phone, 
    CalendarBlank, 
    GenderIntersex,
    PencilSimple, 
    SignOut,
    Check,
    X,
    User,
    Camera
} from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../../store/slices/authSlice';
import { atualizarPerfilCliente } from '../../../store/slices/clienteSlice';
import { setUsuario } from '../../../store/slices/authSlice';

export default function PerfilCliente() {
    const { usuario } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fotoPreview, setFotoPreview] = useState(usuario?.foto || '');
    const [formData, setFormData] = useState({
        nome: usuario?.nome || '',
        email: usuario?.email || '',
        telefone: usuario?.telefone || '',
        sexo: usuario?.sexo || '',
        dataNascimento: usuario?.dataNascimento || '',
        foto: usuario?.foto || '',
    });

    useEffect(() => {
        if (usuario) {
            setFormData({
                nome: usuario.nome || '',
                email: usuario.email || '',
                telefone: usuario.telefone || '',
                sexo: usuario.sexo || '',
                dataNascimento: usuario.dataNascimento || '',
                foto: usuario.foto || '',
            });
            setFotoPreview(usuario.foto || '');
        }
    }, [usuario]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Por favor, selecione uma imagem válida');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('A imagem deve ter no máximo 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setFotoPreview(reader.result);
        };
        reader.readAsDataURL(file);
        
        setFormData((prev) => ({
            ...prev,
            foto: file,
        }));
    };

    const handleRemoverFoto = () => {
        setFotoPreview('');
        setFormData((prev) => ({
            ...prev,
            foto: '',
        }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSave = async () => {
        if (!formData.nome || !formData.email || !formData.telefone) {
            toast.error('Nome, email e telefone são obrigatórios');
            return;
        }

        setLoading(true);
        try {
            const result = await dispatch(
                atualizarPerfilCliente({
                    clienteId: usuario?.id,
                    nome: formData.nome,
                    email: formData.email,
                    telefone: formData.telefone,
                    sexo: formData.sexo,
                    dataNascimento: formData.dataNascimento,
                    foto: formData.foto,
                })
            );

            if (result.payload) {
                const usuarioAtualizado = { ...usuario, ...result.payload };
                localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));
                dispatch(setUsuario(usuarioAtualizado));
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            nome: usuario?.nome || '',
            email: usuario?.email || '',
            telefone: usuario?.telefone || '',
            sexo: usuario?.sexo || '',
            dataNascimento: usuario?.dataNascimento || '',
        });
        setIsEditing(false);
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    // Componente de Campo Reutilizável
    const ProfileField = ({ icon: Icon, label, value, name, type = 'text', options = null }) => {
        const isEmpty = !value || value === '';
        
        return (
            <div className="group">
                <label 
                    htmlFor={name}
                    className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5"
                >
                    <Icon size={16} weight="duotone" className="text-gray-400" />
                    {label}
                </label>
                {isEditing ? (
                    options ? (
                        <select
                            id={name}
                            name={name}
                            value={value}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 font-medium
                                focus:bg-white focus:border-[#CDA327] focus:ring-2 focus:ring-[#CDA327]/20 
                                transition-all duration-200 outline-none hover:border-gray-400"
                            aria-label={label}
                        >
                            <option value="">Selecione...</option>
                            {options.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    ) : (
                        <input
                            id={name}
                            type={type}
                            name={name}
                            value={value}
                            onChange={handleChange}
                            placeholder={type === 'tel' ? '(11) 99999-9999' : ''}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 font-medium
                                focus:bg-white focus:border-[#CDA327] focus:ring-2 focus:ring-[#CDA327]/20 
                                transition-all duration-200 outline-none hover:border-gray-400"
                            aria-label={label}
                        />
                    )
                ) : (
                    <div className={`px-4 py-3 rounded-xl border transition-colors duration-200 ${
                        isEmpty 
                            ? 'bg-gray-50 border-gray-200' 
                            : 'bg-slate-50 border-slate-200'
                    }`}>
                        <p className={`text-base font-medium ${isEmpty ? 'text-gray-400 italic' : 'text-gray-900'}`}>
                            {isEmpty ? 'Não informado' : value}
                        </p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Card Principal com Animação */}
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200 
                    transform transition-all duration-300 hover:shadow-2xl">
                    
                    {/* Header Neutro */}
                    <div className="relative bg-gradient-to-r from-slate-700 via-slate-800 to-slate-700 px-6 sm:px-8 py-10">
                        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
                        
                        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
                            <div className="relative flex-shrink-0 group">
                                <div className="flex items-center justify-center h-24 w-24 rounded-2xl 
                                    bg-white/20 backdrop-blur-sm border-4 border-white/30 shadow-lg overflow-hidden">
                                    {fotoPreview ? (
                                        <img 
                                            src={fotoPreview} 
                                            alt="Foto de perfil" 
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <UserCircle size={56} weight="duotone" className="text-white" />
                                    )}
                                </div>
                                <div className="absolute bottom-1 right-1 h-5 w-5 bg-green-400 border-4 
                                    border-white rounded-full shadow-lg" 
                                    title="Online"
                                />
                                {isEditing && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 
                                        backdrop-blur-[2px] rounded-2xl opacity-0 group-hover:opacity-100 
                                        transition-opacity duration-200">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-2 bg-[#CDA327] hover:bg-[#B8921F] rounded-lg 
                                                transition-colors shadow-lg"
                                            aria-label="Alterar foto"
                                            title="Alterar foto"
                                        >
                                            <Camera size={24} weight="duotone" className="text-white" />
                                        </button>
                                        {fotoPreview && (
                                            <button
                                                onClick={handleRemoverFoto}
                                                className="ml-2 p-2 bg-red-500 hover:bg-red-600 rounded-lg 
                                                    transition-colors shadow-lg"
                                                aria-label="Remover foto"
                                                title="Remover foto"
                                            >
                                                <X size={24} weight="bold" className="text-white" />
                                            </button>
                                        )}
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFotoChange}
                                    className="hidden"
                                    aria-label="Selecionar foto de perfil"
                                />
                            </div>

                            <div className="flex-1 text-center sm:text-left">
                                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                                    {usuario?.nome || 'Cliente'}
                                </h1>
                                <div className="flex items-center justify-center sm:justify-start gap-2 text-amber-50">
                                    <EnvelopeSimple size={18} weight="duotone" />
                                    <p className="text-base">{usuario?.email || 'email@exemplo.com'}</p>
                                </div>
                            </div>

                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="absolute top-6 right-6 sm:relative sm:top-0 sm:right-0
                                        flex items-center gap-2 px-5 py-2.5 bg-white/15 hover:bg-white/25 
                                        backdrop-blur-sm border border-white/20 rounded-xl text-white font-medium
                                        transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
                                    aria-label="Editar perfil"
                                >
                                    <PencilSimple size={20} weight="duotone" />
                                    <span className="hidden sm:inline">Editar</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="p-6 sm:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                Informações Pessoais
                            </h2>
                            {isEditing && (
                                <span className="text-sm text-yellow-800 font-medium px-3 py-1 bg-yellow-50 rounded-full border border-yellow-200/50">
                                    Modo de Edição
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="sm:col-span-2">
                                <ProfileField 
                                    icon={User} 
                                    label="Nome Completo" 
                                    value={formData.nome}
                                    name="nome"
                                />
                            </div>
                            
                            <ProfileField 
                                icon={EnvelopeSimple} 
                                label="E-mail" 
                                value={formData.email}
                                name="email"
                                type="email"
                            />
                            
                            <ProfileField 
                                icon={Phone} 
                                label="Telefone" 
                                value={formData.telefone}
                                name="telefone"
                                type="tel"
                            />
                            
                            <ProfileField 
                                icon={CalendarBlank} 
                                label="Data de Nascimento" 
                                value={formData.dataNascimento}
                                name="dataNascimento"
                                type="date"
                            />
                            
                            <ProfileField 
                                icon={GenderIntersex} 
                                label="Sexo" 
                                value={formData.sexo}
                                name="sexo"
                                options={[
                                    { value: 'Masculino', label: 'Masculino' },
                                    { value: 'Feminino', label: 'Feminino' }
                                ]}
                            />
                        </div>

                        {isEditing && (
                            <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200">
                                <button
                                    onClick={handleCancel}
                                    disabled={loading}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 
                                        hover:bg-gray-200 text-gray-700 font-semibold rounded-xl 
                                        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                                        border border-gray-200"
                                >
                                    <X size={20} weight="bold" />
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 
                                        bg-[#CDA327] hover:bg-[#B89020]
                                        text-white font-semibold rounded-xl shadow-lg shadow-slate-900/10
                                        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                                        hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={20} weight="bold" />
                                            Salvar Alterações
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="px-6 sm:px-8 py-6 bg-gray-50 border-t border-gray-200">
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 
                                hover:bg-red-50 rounded-lg font-medium transition-all duration-200
                                group"
                        >
                            <SignOut size={20} weight="duotone" className="group-hover:scale-110 transition-transform" />
                            Sair da Conta
                        </button>
                    </div>
                </div>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Última atualização: {new Date().toLocaleDateString('pt-BR')}
                </p>
            </div>
        </div>
    );
}
