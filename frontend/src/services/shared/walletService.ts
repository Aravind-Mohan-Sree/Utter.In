import axios from '~utils/axiosConfig';

export interface Transaction {
    amount: number;
    type: 'credit' | 'debit';
    description: string;
    date: string;
}

export interface Wallet {
    balance: number;
    currency: string;
    transactions: Transaction[];
}

export const getWalletTransactions = async (role: string = 'user'): Promise<Wallet> => {
    try {
        const response = await axios.get(`/${role}/wallet`);
        return response.data.wallet;
    } catch (error) {
        throw error;
    }
};
