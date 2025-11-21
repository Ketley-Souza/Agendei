import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ClockIcon,
  CalendarIcon,
  ChatText,
  Phone,
  MapPin,
  ShareNetwork,
} from "@phosphor-icons/react";
import api from "../../../services/api";
import CONSTS from "../../../consts";
import util from "../../../services/util";
import {
  setServicoSelecionado,
  limparServicoSelecionado,
} from "../../../store/slices/agendamentoSlice";

const { salaoId, apiUrl } = CONSTS;

const HomeCliente = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const clienteId = useSelector((state) => state.auth.usuario?.id);
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(false);

  // ------------------ FUNÇÃO PARA PEGAR IMAGEM DO BANCO ------------------
  const getFoto = (servico) => {
    const img = servico?.imagem || servico?.foto;

    if (!img) return "/placeholder.png";

    // se já for URL completa (startsWith http)
    if (img.startsWith("http")) return img;

    // caso venha sem a barra inicial, corrige e adiciona prefixo da API
    return `${apiUrl}/${img.replace(/^\/+/, "")}`;
  };

  useEffect(() => {
    const carregarServicos = async () => {
      setLoading(true);
      try {
        const resposta = await api.get(`/servico/salao/${salaoId}`);
        const lista = resposta?.data?.servicos || [];
        setServicos(lista.slice(0, 3));
      } catch (error) {
        console.error("Erro ao carregar serviços:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarServicos();
  }, []);

  const irParaAgendamento = (servicoSelecionado = null) => {
    const usuarioSalvo = util.getUsuarioFromLocalStorage();
    if (!usuarioSalvo) {
      navigate("/login");
      return;
    }

    if (servicoSelecionado) {
      dispatch(setServicoSelecionado(servicoSelecionado));
    } else {
      dispatch(limparServicoSelecionado());
    }

    navigate("/agendamento");
  };

  const compartilharPagina = async () => {
    const link = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: "Agende seu horário ✨",
        text: "Confira os serviços disponíveis!",
        url: link,
      }).catch(err => console.log("Compartilhamento cancelado", err));
    } else {
      navigator.clipboard.writeText(link);
      alert("🔗 Link copiado!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center px-2 sm:px-4 pt-5 pb-10">

      <div className="bg-white rounded-2xl pb-10 w-full max-w-3xl font-catamaran overflow-hidden">

        {/* -------- BANNER + LOGO -------- */}
        <div className="relative w-full h-64 sm:h-72">
          <img
            src="/salao-login.jpg"
            alt="Salão"
            className="w-full h-full object-cover"
          />

          {/* LOGO CENTRALIZADA */}
          <img
            src="/logo.png"
            alt="Logo"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
            w-40 sm:w-52 md:w-60 object-contain drop-shadow-2xl"
          />
        </div>

        {/* -------- BOTÕES RÁPIDOS -------- */}
        <div className="grid grid-cols-4 gap-2 bg-white py-4 px-5">

          <a
            href={`https://wa.me/5534992338445?text=${encodeURIComponent("Olá! Gostaria de agendar um horário 😊")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center text-gray-700"
          >
            <div className="w-14 h-14 bg-yellow-50 rounded-xl flex items-center justify-center">
              <ChatText size={24} />
            </div>
            <p className="text-xs mt-1">Mensagem</p>
          </a>

          <a href="tel:+5534992338445" className="flex flex-col items-center text-gray-700">
            <div className="w-14 h-14 bg-yellow-50 rounded-xl flex items-center justify-center">
              <Phone size={24} />
            </div>
            <p className="text-xs mt-1">Ligar</p>
          </a>

          <a
            href="https://www.google.com/maps?q=Av.+Patr%C3%ADcio+Filho,+05+-+Jardim+Esperanca,+Patos+de+Minas+-+MG,+38703-698"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center text-gray-700"
          >
            <div className="w-14 h-14 bg-yellow-50 rounded-xl flex items-center justify-center">
              <MapPin size={24} />
            </div>
            <p className="text-xs mt-1">Visitar</p>
          </a>

          <button onClick={compartilharPagina} className="flex flex-col items-center text-gray-700">
            <div className="w-14 h-14 bg-yellow-50 rounded-xl flex items-center justify-center">
              <ShareNetwork size={24} />
            </div>
            <p className="text-xs mt-1">Enviar</p>
          </button>
        </div>

        {/* -------- BOTÃO AGENDAR -------- */}
        <div className="px-5 mt-6">
          <button
            onClick={() => irParaAgendamento()}
            className="w-full flex items-center justify-center bg-black text-white p-4 rounded-xl text-lg gap-3 hover:bg-neutral-900 transition-all"
          >
            <ClockIcon size={22} />
            Agendar agora
          </button>
        </div>

        {/* -------- LISTA DE SERVIÇOS -------- */}
        <div className="px-5 mt-6">
          <h2 className="text-xl font-semibold mb-4">
            Serviços em Destaque
          </h2>

          {loading && <p className="text-gray-500 text-center">Carregando...</p>}

          {servicos.map((servico) => (
            <button
              key={servico._id}
              onClick={() => irParaAgendamento(servico)}
              className="w-full flex items-center justify-between bg-gray-50 rounded-xl p-4 mb-4 hover:scale-[1.02] transition-all"
            >
              <div className="flex items-center gap-4">
                <img
                  src={getFoto(servico)}
                  alt={servico.nomeServico}
                  className="w-20 h-20 rounded-xl object-cover border border-gray-200"
                />

                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {servico.nomeServico}
                  </p>
                  <p className="font-bold text-gray-800">
                    R$ {servico.preco}{" "}
                    <span className="text-gray-500 text-xs ml-1">a partir</span>
                  </p>

                  <div className="flex items-center gap-2 text-gray-500 text-xs mt-1">
                    <ClockIcon size={14} />
                    <span>{servico.duracao || "Duração não informada"}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-200 p-3 rounded-full">
                <CalendarIcon size={22} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeCliente;
