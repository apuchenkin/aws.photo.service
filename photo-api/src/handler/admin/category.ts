import * as express from 'express';
import { Connection } from 'typeorm';
import { Category, Photo } from '@app/entity';

const photoRouter = express.Router({ mergeParams: true });

photoRouter
  .get('/', async (req, res) => {
    const connection: Connection = req.app.locals.connection;

    const photos = await connection
      .getRepository(Photo)
      .createQueryBuilder('photo')
      .leftJoinAndSelect("photo.translations", "translation")
      .innerJoinAndSelect("photo.categories", "category$", "category$.name = :name", { name: req.params.category })
      .leftJoinAndSelect("photo.categories", "category")
      .orderBy('photo.datetime')
      .getMany();

    res.send(photos);
  })
  // @ts-ignore
  .link('/', async (req, res) => {
    const pids: number[] = req.body;
    const connection: Connection = req.app.locals.connection;
    const repository = connection.getRepository(Category);
    const category = await repository.findOne({
      name: req.params.category
    })

    try{
      await repository
      .createQueryBuilder()
      .relation('photos')
      .of(category.id)
      .add(pids);

      res.sendStatus(204);
    } catch (error) {
      res.status(304).send(error);
    }
  })
  // @ts-ignore
  .unlink('/', async (req, res) => {
    const pids: number[] = req.body;
    const connection: Connection = req.app.locals.connection;
    const repository = connection.getRepository(Category);
    const category = await repository.findOne({
      name: req.params.category
    })

    try {
      await repository
        .createQueryBuilder()
        .relation('photos')
        .of(category.id)
        .remove(pids);

      res.sendStatus(204);
    } catch (error) {
      res.status(304).send(error);
    }
  });
;

const categoryRouter = express.Router({ mergeParams: true });
categoryRouter
  .use('/photo', photoRouter)
  .get('/', async (req, res) => {
    const connection: Connection = req.app.locals.connection;
    const category = await connection
      .getRepository(Category)
      .createQueryBuilder('category')
      .leftJoinAndSelect("category.translations", "translation")
      .leftJoinAndSelect("category.featured", "featured")
      .leftJoinAndSelect("category.parent", "parent")
      .leftJoinAndSelect("category.children", "children")
      .where('category.name = :name', { name: req.params.category })
      .getOne();

    if (!category) {
      res.sendStatus(404);
    } else {
      res.send(category)
    }
  })
  .put('/', async (req, res) => {
    const connection: Connection = req.app.locals.connection;
    const repository = connection.getRepository(Category);

    try {
      const category = await repository.findOne({
        name: req.params.category
      });

      const category$ = await repository
        .save(repository.merge(category, req.body))

      res.send(category$);
    } catch (error) {
      res.status(400).send(error);
    }
  })
  .delete('/', async (req, res) => {
    const connection: Connection = req.app.locals.connection;

    try {
      await connection
        .getRepository(Category)
        .delete({ name: req.params.category })

      res.sendStatus(204);
    } catch (error) {
      res.status(400).send(error);
    }
  })
;

const categoriesRouter = express.Router();
categoriesRouter
  .use(express.json())
  .use('/:category', categoryRouter)
  .get('/', async (req, res) => {
    const connection: Connection = req.app.locals.connection;

    const categories = await connection
      .getRepository(Category)
      .createQueryBuilder('category')
      .leftJoinAndSelect("category.translations", "translation")
      .leftJoinAndSelect("category.featured", "featured")
      .leftJoinAndSelect("category.parent", "parent")
      .leftJoinAndSelect("category.children", "children")
      .getMany();

    res.send(categories);
  })
  .post('/', async (req, res) => {
    const connection: Connection = req.app.locals.connection;

    try {
      const category = await connection
      .getRepository(Category)
      .save(req.body)

      res.send(category);
    } catch (error) {
      res.status(400).send(error);
    }
  })
;

export default categoriesRouter;
