import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

import Transaction from '../models/Transaction';

interface Resquest {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute(data: Resquest): Promise<Transaction> {
    if (data.type !== 'income' && data.type !== 'outcome') {
      throw new AppError('Field type not equal the income or outcome', 400);
    }

    const transactionRepository = getCustomRepository(TransactionsRepository);

    const categoryRepository = getRepository(Category);

    const { total } = await transactionRepository.getBalance();

    if (total < data.value && data.type === 'outcome') {
      throw new AppError('Transaction total is less than the outcome', 400);
    }

    let createCategory = await categoryRepository.findOne({
      where: { title: data.category },
    });

    if (!createCategory) {
      createCategory = categoryRepository.create({
        title: data.category,
      });

      await categoryRepository.save(createCategory);
    }

    const transaction = transactionRepository.create({
      title: data.title,
      type: data.type,
      value: data.value,
      category: createCategory,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
