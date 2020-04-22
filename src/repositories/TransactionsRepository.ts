import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const totalIncomes = transactions
      .filter(({ type }) => type === 'income')
      .reduce((acm, vlat) => acm + vlat.value, 0);

    const totalOutcome = transactions
      .filter(({ type }) => type === 'outcome')
      .reduce((acm, vlat) => acm + vlat.value, 0);

    const total = totalIncomes - totalOutcome;

    const balance = {
      income: totalIncomes,
      outcome: totalOutcome,
      total,
    };

    return balance;
  }
}

export default TransactionsRepository;
