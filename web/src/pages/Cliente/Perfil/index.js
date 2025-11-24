import React, { useState, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { UserCircle, EnvelopeSimple, Phone, CalendarBlank, GenderIntersex, PencilSimple, SignOut, Check, X, User, Camera } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { logout, setUsuario } from "../../../store/slices/authSlice";
import { atualizarPerfilCliente } from "../../../store/slices/clienteSlice";

export default function PerfilCliente() {
    const usuario = useSelector((state) => state.auth.usuario);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const fileInputRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Estado do formulário
    const [form, setForm] = useState(() => ({
        nome: usuario?.nome || "",
        email: usuario?.email || "",
        telefone: usuario?.telefone || "",
        sexo: usuario?.sexo || "",
        dataNascimento: usuario?.dataNascimento || "",
        foto: usuario?.foto || "",
        fotoPreview: usuario?.foto || ""
    }));

    // Handlers
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleFotoChange = useCallback((e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Por favor, selecione uma imagem válida");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("A imagem deve ter no máximo 5MB");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setForm((prev) => ({
                ...prev,
                foto: file,
                fotoPreview: reader.result
            }));
        };
        reader.readAsDataURL(file);
    }, []);

    const handleRemoverFoto = useCallback(() => {
        setForm((prev) => ({
            ...prev,
            foto: "",
            fotoPreview: ""
        }));

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, []);

    const handleSave = async () => {
        if (!form.nome || !form.email || !form.telefone) {
            toast.error("Nome, email e telefone são obrigatórios");
            return;
        }

        setLoading(true);
        try {
            const clienteId = usuario?._id || usuario?.id;

            if (!clienteId) {
                toast.error("ID do cliente não encontrado");
                setLoading(false);
                return;
            }

            const result = await dispatch(
                atualizarPerfilCliente({
                    clienteId,
                    nome: form.nome,
                    email: form.email,
                    telefone: form.telefone,
                    sexo: form.sexo,
                    dataNascimento: form.dataNascimento,
                    foto: form.foto
                })
            ).unwrap();  // ← ESSENCIAL

            const usuarioAtualizado = {
                ...usuario,
                ...result,
                id: clienteId,
                _id: clienteId
            };

            localStorage.setItem("usuario", JSON.stringify(usuarioAtualizado));
            dispatch(setUsuario(usuarioAtualizado));
            setIsEditing(false);

            toast.success("Perfil atualizado com sucesso!");
        } catch (err) {
            console.error(err);
            toast.error("Erro ao atualizar perfil.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = useCallback(() => {
        setForm({
            nome: usuario?.nome || "",
            email: usuario?.email || "",
            telefone: usuario?.telefone || "",
            sexo: usuario?.sexo || "",
            dataNascimento: usuario?.dataNascimento || "",
            foto: usuario?.foto || "",
            fotoPreview: usuario?.foto || ""
        });

        setIsEditing(false);
    }, [usuario]);

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200 transition-all hover:shadow-2xl">

                    {/* HEADER */}
                    <div className="relative bg-gradient-to-r from-slate-700 via-slate-800 to-slate-700 px-6 sm:px-8 py-10">
                        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />

                        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
                            {/* Foto */}
                            <div className="relative group flex-shrink-0">
                                <div className="flex items-center justify-center h-24 w-24 rounded-2xl bg-white/20 backdrop-blur-sm border-4 border-white/30 shadow-lg overflow-hidden">
                                    {form.fotoPreview ? (
                                        <img src={form.fotoPreview} className="h-full w-full object-cover" alt="Foto" />
                                    ) : (
                                        <UserCircle size={56} weight="duotone" className="text-white" />
                                    )}
                                </div>

                                {/* Status */}
                                <span className="absolute bottom-1 right-1 h-5 w-5 bg-green-400 border-4 border-white rounded-full shadow-lg" />

                                {/* Ações de foto */}
                                {isEditing && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-2 bg-[#CDA327] hover:bg-[#B8921F] rounded-lg shadow-lg"
                                        >
                                            <Camera size={24} className="text-white" />
                                        </button>

                                        {form.fotoPreview && (
                                            <button
                                                onClick={handleRemoverFoto}
                                                className="ml-2 p-2 bg-red-500 hover:bg-red-600 rounded-lg shadow-lg"
                                            >
                                                <X size={24} className="text-white" />
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
                                />
                            </div>

                            {/* Nome */}
                            <div className="flex-1 text-center sm:text-left">
                                <h1 className="text-3xl font-bold text-white mb-2">
                                    {usuario?.nome || "Cliente"}
                                </h1>
                                <div className="flex items-center justify-center sm:justify-start gap-2 text-amber-50">
                                    <EnvelopeSimple size={18} weight="duotone" />
                                    <span>{usuario?.email}</span>
                                </div>
                            </div>

                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="absolute top-6 right-6 sm:relative flex items-center gap-2 px-5 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl text-white transition-all shadow-lg"
                                >
                                    <PencilSimple size={20} />
                                    <span className="hidden sm:inline">Editar</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* FORM */}
                    <div className="p-6 sm:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Informações Pessoais</h2>

                            {isEditing && (
                                <span className="text-sm text-yellow-800 font-medium px-3 py-1 bg-yellow-50 rounded-full border border-yellow-200">
                                    Modo de Edição
                                </span>
                            )}
                        </div>

                        {/* Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                            {/* Nome */}
                            <div className="sm:col-span-2">
                                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase mb-2.5">
                                    <User size={16} className="text-gray-400" /> Nome Completo
                                </label>

                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="nome"
                                        value={form.nome}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-[#CDA327]/20"
                                    />
                                ) : (
                                    <div className="px-4 py-3 bg-slate-50 rounded-xl border">
                                        {form.nome || "Não informado"}
                                    </div>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase mb-2.5">
                                    <EnvelopeSimple size={16} className="text-gray-400" /> E-mail
                                </label>

                                {isEditing ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-[#CDA327]/20"
                                    />
                                ) : (
                                    <div className="px-4 py-3 bg-slate-50 rounded-xl border">
                                        {form.email || "Não informado"}
                                    </div>
                                )}
                            </div>

                            {/* Telefone */}
                            <div>
                                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase mb-2.5">
                                    <Phone size={16} className="text-gray-400" /> Telefone
                                </label>

                                {isEditing ? (
                                    <input
                                        type="tel"
                                        name="telefone"
                                        value={form.telefone}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-white border rounded-xl"
                                    />
                                ) : (
                                    <div className="px-4 py-3 bg-slate-50 rounded-xl border">
                                        {form.telefone || "Não informado"}
                                    </div>
                                )}
                            </div>

                            {/* Data Nascimento */}
                            <div>
                                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase mb-2.5">
                                    <CalendarBlank size={16} className="text-gray-400" /> Data de Nascimento
                                </label>

                                {isEditing ? (
                                    <input
                                        type="date"
                                        name="dataNascimento"
                                        value={form.dataNascimento}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-white border rounded-xl"
                                    />
                                ) : (
                                    <div className="px-4 py-3 bg-slate-50 rounded-xl border">
                                        {form.dataNascimento || "Não informado"}
                                    </div>
                                )}
                            </div>

                            {/* Sexo */}
                            <div>
                                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase mb-2.5">
                                    <GenderIntersex size={16} className="text-gray-400" /> Sexo
                                </label>

                                {isEditing ? (
                                    <select
                                        name="sexo"
                                        value={form.sexo}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-white border rounded-xl"
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="Masculino">Masculino</option>
                                        <option value="Feminino">Feminino</option>
                                    </select>
                                ) : (
                                    <div className="px-4 py-3 bg-slate-50 rounded-xl border">
                                        {form.sexo || "Não informado"}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Botões */}
                        {isEditing && (
                            <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t">
                                <button
                                    onClick={handleCancel}
                                    disabled={loading}
                                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center gap-2 text-gray-700"
                                >
                                    <X size={20} /> Cancelar
                                </button>

                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 bg-[#CDA327] hover:bg-[#B89020] text-white rounded-xl flex items-center justify-center gap-2 shadow-lg"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={20} /> Salvar Alterações
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 sm:px-8 py-6 bg-gray-50 border-t">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg"
                        >
                            <SignOut size={20} /> Sair da Conta
                        </button>
                    </div>
                </div>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Última atualização: {new Date().toLocaleDateString("pt-BR")}
                </p>
            </div>
        </div>
    );
}
