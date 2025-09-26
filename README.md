# AGENDEI – Plataforma Digital de Agendamento 


## Descrição do Projeto  
O **AGENDEI** é uma plataforma web de agendamento voltada para microempreendedores e clientes do setor de beleza, criada para substituir métodos manuais de marcação de horários por uma solução prática e confiável. A proposta é oferecer uma experiência acessível para que os clientes consultem horários disponíveis e realizem reservas de serviços.

O projeto está em fase inicial e será desenvolvido como parte da disciplina **Projeto Integrador III** do curso de Sistemas de Informação, com foco em otimizar a comunicação, reduzir conflitos de horários e tornar o processo de agendamento mais eficiente e moderno.  

## Tecnologias (planejadas)  
- React.js (Front-end)  
- Node.js (Back-end)  
- MongoDB (Banco de Dados)  
- Figma (Prototipagem)  
- Git / GitHub (Controle de versão)

## ⚙️ Como Executar



public class Deque<T> {

    private NoDuplo<T> primeiroNo;
    private NoDuplo<T> ultimoNo;
    private String nomeDeque;
    private int tamanho;

    public Deque(String nomeDeque) {
        this.primeiroNo = null;
        this.ultimoNo = null;
        this.nomeDeque = nomeDeque;
        this.tamanho = 0;
    }

    public void addInicio(T dado) {
        NoDuplo<T> novoNo = new NoDuplo<T>(dado);
        if (primeiroNo == null) {
            primeiroNo = ultimoNo = novoNo;
        } else {
            novoNo.setProximoNo(primeiroNo);
            primeiroNo.setAnteriorNo(novoNo);
            primeiroNo = novoNo;
        }
        atualizaIndice();
        tamanho++;
    }

    public T removeInicio() {
        if (primeiroNo == null) {
            System.out.println("Lista Vazia.");
            return null;
        } else {
            T dadoTemp = primeiroNo.getDado();
            primeiroNo = primeiroNo.getProximoNo();

            if (primeiroNo != null) {
                primeiroNo.setAnteriorNo(null);
            } else {
                ultimoNo = null;
            }
            tamanho--;
            return dadoTemp; // Retorna o dado removido
        }
    }

    public void addFinal(T dado) {
        NoDuplo<T> novoNo = new NoDuplo<T>(dado);
        if (ultimoNo == null) {
            primeiroNo = novoNo;
            ultimoNo = novoNo;
        } else {
            novoNo.setAnteriorNo(ultimoNo);
            ultimoNo.setProximoNo(novoNo);
            ultimoNo = novoNo;
        }
        atualizaIndice();
        tamanho++;
    }

    public T removeFinal() {
        if (ultimoNo == null) {
            System.out.println("Deque Vazio.");
            return null;
        } else {
            T dadoTemp = ultimoNo.getDado();
            ultimoNo = ultimoNo.getAnteriorNo();

            if (ultimoNo != null) {
                ultimoNo.setProximoNo(null);
            } else {
                primeiroNo = null;
            }
            tamanho--;
            return dadoTemp; // Retorna o dado removido
        }
    }

    public T peekInicio() {
        if (primeiroNo == null) {
            System.out.println("Deque Vazio.");
            return null;
        }
        return primeiroNo.getDado();
    }

    public T peekFinal() {
        if (ultimoNo == null) {
            System.out.println("Deque Vazio");
            return null;
        }
        return ultimoNo.getDado();
    }

    public void imprimeLista() {
        if (primeiroNo == null) {
            System.out.println("Lista Vazia.");
        } else {
            System.out.println("Dados da Lista " + nomeDeque);
            NoDuplo<T> aux = primeiroNo;
            while (aux != null) {
                System.out.printf(" %s ", aux.toString());
                aux = aux.getProximoNo();
            }
            System.out.println();
        }
    }

    public void atualizaIndice() {
        NoDuplo<T> atual = primeiroNo;
        int indice = 0;
        while (atual != null) {
            atual.setIndice(indice);
            atual = atual.getProximoNo();
            indice++;
        }
    }

    public int TamanhoDeque() {
        return tamanho;
    }

}





public class NoDuplo<T>{
    private T dado;
    private NoDuplo<T> proximoNo;
    private NoDuplo<T> anteriorNo;
    private int indice;

    public NoDuplo(T dado){
        this.dado = dado;
        this.indice = 0;
        this.anteriorNo = null;
        this.proximoNo = null;
    }

    public T getDado(){
        return this.dado;
    }

    public void setDado(T dado){
        this.dado = dado;
    }

    public NoDuplo<T> getProximoNo(){
        return this.proximoNo;
    }

    public void setProximoNo(NoDuplo<T> proximoNo){
        this.proximoNo = proximoNo;
    }

    public NoDuplo<T> getAnteriorNo(){
        return this.anteriorNo;
    }

    public void setAnteriorNo(NoDuplo<T> anteriorNo){
        this.anteriorNo = anteriorNo;
    }

    public int getIndice(){
        return this.indice;
    }

    public void setIndice(int indice){
        this.indice = indice;
    }


    @Override
    public String toString(){
        return "\n{ | Dado: " + getDado() + "}";

    }

    
}



public class Principal {
    public static void main(String[] args) {
        Deque<String> deque = new Deque<>("Alunos");

        deque.addInicio("Ket");

        System.out.println("Primeiro no: " + deque.peekInicio());
        System.out.println("Ultimo no: " + deque.peekFinal());

        System.out.println("Tamanho do Deque: " + deque.TamanhoDeque());
        //deque.destruirDeque();
        
    }
}

