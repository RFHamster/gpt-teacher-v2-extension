export interface ItemData {
    id: string;
    title: string;
    description: string;
    miniDescription?: string;
    is_done: boolean;
}

export interface ItemsByCategory {
    [category: string]: ItemData[];
}

// Mock data - será substituído por dados reais depois
export const mockItemsByCategory: ItemsByCategory = {
    'Extensão VSCode': [
        {
            id: '1',
            title: 'Introdução ao TypeScript',
            description: 'Aprenda os fundamentos do TypeScript para criar extensões robustas.',
            miniDescription: 'Fundamentos da linguagem, Fundamentos da linguagemFundamentos da linguagemFundamentos da linguagemFundamentos da linguagemFundamentos da linguagemFundamentos da linguagemFundamentos da linguagemFundamentos da linguagemFundamentos da linguagemFundamentos da linguagem',
            is_done: true
        },
        {
            id: '2',
            title: 'Arquitetura de Extensões',
            description: 'Entenda a estrutura e organização de uma extensão do VSCode.',
            miniDescription: 'Estrutura e componentes',
            is_done: true
        },
        {
            id: '3',
            title: 'WebViews e Interface',
            description: 'Crie interfaces web personalizadas dentro do VSCode.',
            miniDescription: 'Interface customizada',
            is_done: false
        }
    ],
    'Estudos de Matemática': [
        {
            id: '4',
            title: 'Álgebra Linear',
            description: 'Fundamentos de vetores, matrizes e transformações lineares.',
            miniDescription: 'Vetores e matrizes',
            is_done: true
        },
        {
            id: '5',
            title: 'Cálculo Diferencial',
            description: 'Derivadas, limites e aplicações do cálculo diferencial.',
            miniDescription: 'Derivadas e limites',
            is_done: false
        },
        {
            id: '6',
            title: 'Estatística e Probabilidade',
            description: 'Conceitos fundamentais de estatística e teoria da probabilidade.',
            miniDescription: 'Distribuições e análise',
            is_done: false
        }
    ],
    'Estudos de Matemática1': [
        {
            id: '4',
            title: 'Álgebra Linear',
            description: 'Fundamentos de vetores, matrizes e transformações lineares.',
            miniDescription: 'Vetores e matrizes',
            is_done: true
        },
        {
            id: '5',
            title: 'Cálculo Diferencial',
            description: 'Derivadas, limites e aplicações do cálculo diferencial.',
            miniDescription: 'Derivadas e limites',
            is_done: false
        },
        {
            id: '6',
            title: 'Estatística e Probabilidade',
            description: 'Conceitos fundamentais de estatística e teoria da probabilidade.',
            miniDescription: 'Distribuições e análise',
            is_done: false
        }
    ],
    'Estudos de Matemática2': [
        {
            id: '4',
            title: 'Álgebra Linear',
            description: 'Fundamentos de vetores, matrizes e transformações lineares.',
            miniDescription: 'Vetores e matrizes',
            is_done: true
        },
        {
            id: '5',
            title: 'Cálculo Diferencial',
            description: 'Derivadas, limites e aplicações do cálculo diferencial.',
            miniDescription: 'Derivadas e limites',
            is_done: false
        },
        {
            id: '6',
            title: 'Estatística e Probabilidade',
            description: 'Conceitos fundamentais de estatística e teoria da probabilidade.',
            miniDescription: 'Distribuições e análise',
            is_done: false
        }
    ],
    'Estudos de Matemática3': [
        {
            id: '4',
            title: 'Álgebra Linear',
            description: 'Fundamentos de vetores, matrizes e transformações lineares.',
            miniDescription: 'Vetores e matrizes',
            is_done: true
        },
        {
            id: '5',
            title: 'Cálculo Diferencial',
            description: 'Derivadas, limites e aplicações do cálculo diferencial.',
            miniDescription: 'Derivadas e limites',
            is_done: false
        },
        {
            id: '6',
            title: 'Estatística e Probabilidade',
            description: 'Conceitos fundamentais de estatística e teoria da probabilidade.',
            miniDescription: 'Distribuições e análise',
            is_done: false
        }
    ],
    'Estudos de Matemática4': [
        {
            id: '4',
            title: 'Álgebra Linear',
            description: 'Fundamentos de vetores, matrizes e transformações lineares.',
            miniDescription: 'Vetores e matrizes',
            is_done: true
        },
        {
            id: '5',
            title: 'Cálculo Diferencial',
            description: 'Derivadas, limites e aplicações do cálculo diferencial.',
            miniDescription: 'Derivadas e limites',
            is_done: false
        },
        {
            id: '6',
            title: 'Estatística e Probabilidade',
            description: 'Conceitos fundamentais de estatística e teoria da probabilidade.',
            miniDescription: 'Distribuições e análise',
            is_done: false
        }
    ]
};
