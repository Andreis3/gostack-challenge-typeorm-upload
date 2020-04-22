import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';

import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const findAllTransactions = await transactionsRepository.find({
    relations: ['category'],
  });

  const transactions = findAllTransactions.reduce<any>(
    (prev, curr) => [
      ...prev,
      {
        id: curr.id,
        title: curr.title,
        value: curr.value,
        type: curr.type,
        category: {
          id: curr.category.id,
          title: curr.category.title,
        },
      },
    ],
    [],
  );
  const balance = await transactionsRepository.getBalance();

  return response.status(200).json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;
  const createdTransaction = new CreateTransactionService();
  const transaction = await createdTransaction.execute({
    title,
    value,
    type,
    category,
  });
  const { id } = transaction;

  return response.status(201).json({ id, title, value, type, category });
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute({
    transaction_id: id,
  });

  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransaction = new ImportTransactionsService();

    const transaction = await importTransaction.execute(request.file.path);

    return response.status(201).json({ transaction });
  },
);

export default transactionsRouter;
