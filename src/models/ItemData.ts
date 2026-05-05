export interface ItemData {
    id: string;
    title: string;
    description: string;
    miniDescription?: string;
    is_done: boolean;
}

export interface CategoryData {
    title: string;
    items: ItemData[];
    pending_items?: number;
}

export interface ItemsByCategory {
    [categoryId: string]: CategoryData;
}

// Mock data - será substituído por dados reais depois
export const mockItemsByCategory: ItemsByCategory = {
    'cat-prog': {
        title: 'Lógica de Programação',
        pending_items: 2,
        items: [
            {
                id: '1',
                title: 'Variáveis e Tipos de Dados',
                description: 'Crie um programa que armazene seu nome, sua idade e sua altura em variáveis separadas. Depois, exiba uma mensagem assim: "Olá, Ana! Você tem 20 anos e mede 1.65m." Use os tipos corretos para cada informação.',
                miniDescription: 'Entenda o que são variáveis, como declará-las e os principais tipos de dados: inteiro, real, texto e booleano. A base para qualquer programa.',
                is_done: true
            },
            {
                id: '2',
                title: 'Condicionais com if e else',
                description: 'Leia a nota de um aluno (0 a 10). Se a nota for maior ou igual a 7, exiba "Aprovado". Se estiver entre 5 e 6.9, exiba "Recuperação". Se for menor que 5, exiba "Reprovado". Teste com as notas 8, 6 e 3.',
                miniDescription: 'Aprenda a tomar decisões no código usando if, else if e else. Veja como o programa escolhe caminhos diferentes dependendo de uma condição.',
                is_done: true
            },
            {
                id: '3',
                title: 'Repetição com while',
                description: 'Crie um programa que peça números ao usuário repetidamente e some todos eles. O programa deve parar quando o usuário digitar 0. Ao final, exiba o total da soma. Exemplo: o usuário digita 3, 7, 2, 0 → soma = 12.',
                miniDescription: 'Descubra como executar um bloco de código várias vezes enquanto uma condição for verdadeira. Entenda o risco de loops infinitos e como evitá-los.',
                is_done: false
            },
            {
                id: '4',
                title: 'Primeiros Problemas com if e while',
                description: 'O número secreto é 42. Peça ao usuário para adivinhar. Se o palpite for maior que 42, diga "Muito alto!". Se for menor, diga "Muito baixo!". Repita até acertar e então exiba "Parabéns, você acertou em X tentativas!".',
                miniDescription: 'Resolva problemas clássicos combinando condicionais e repetição: adivinhe um número, verifique se é par ou ímpar, e calcule a soma de uma sequência.',
                is_done: false
            }
        ]
    },
    'cat-ds': {
        title: 'Estrutura de Dados',
        pending_items: 3,
        items: [
            {
                id: '5',
                title: 'Arrays e Listas',
                description: 'Crie uma lista com 5 nomes de amigos. Percorra a lista com um laço e exiba cada nome numerado: "1. Ana", "2. Bruno", etc. Depois, exiba somente o primeiro e o último nome da lista.',
                miniDescription: 'Conheça a estrutura mais fundamental da programação: o array. Aprenda a armazenar, acessar e percorrer coleções de elementos com índices.',
                is_done: true
            },
            {
                id: '6',
                title: 'Pilhas (Stack)',
                description: 'Simule uma pilha de pratos usando uma lista. Adicione 3 pratos com push (append) e depois retire um por um com pop, exibindo qual prato foi retirado a cada vez. Observe que o último a entrar é o primeiro a sair.',
                miniDescription: 'Entenda a estrutura LIFO (Last In, First Out): o último elemento a entrar é o primeiro a sair. Usada em navegadores, editores de texto e chamadas de funções.',
                is_done: false
            },
            {
                id: '7',
                title: 'Filas (Queue)',
                description: 'Simule uma fila de atendimento: adicione 3 pessoas na fila (["Carlos", "Maria", "João"]). Atenda uma por vez removendo sempre o primeiro da lista e exiba "Atendendo: Carlos", "Atendendo: Maria", etc.',
                miniDescription: 'Aprenda a estrutura FIFO (First In, First Out): o primeiro a entrar é o primeiro a sair. Presente em filas de impressão, sistemas de mensagens e muito mais.',
                is_done: false
            },
            {
                id: '8',
                title: 'Busca e Ordenação',
                description: 'Dada a lista [34, 7, 23, 32, 5], percorra-a procurando o número 23. Exiba em qual posição ele foi encontrado. Depois, ordene a lista do menor para o maior usando bubble sort e exiba o resultado final.',
                miniDescription: 'Implemente algoritmos clássicos como busca linear, busca binária e ordenação por bolha (bubble sort). Compare a eficiência de cada abordagem.',
                is_done: false
            }
        ]
    }
};
