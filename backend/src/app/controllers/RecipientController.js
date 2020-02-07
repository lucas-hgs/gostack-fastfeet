import * as Yup from 'yup';
import { Op } from 'sequelize';

import Recipient from '../models/Recipient';

class RecipientController {
  async index(req, res) {
    const listRecipients = await Recipient.findAll({
      attributes: [
        'id',
        'name',
        'street',
        'number',
        'complement',
        'state',
        'city',
        'zipcode',
      ],
      order: ['id'],
    });

    return res.json(listRecipients);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.string().required(),
      complement: Yup.string(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      zipcode: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const addressExists = await Recipient.findOne({
      where: {
        [Op.and]: [
          { name: req.body.name },
          { street: req.body.street },
          { number: req.body.number },
          { state: req.body.state },
          { city: req.body.city },
          { zipcode: req.body.zipcode },
        ],
      },
    });

    if (addressExists) {
      return res.status(400).json({ error: 'Address is already registered' });
    }

    const {
      id,
      name,
      street,
      number,
      state,
      city,
      zipcode,
    } = await Recipient.create(req.body);

    return res.json({
      id,
      name,
      street,
      number,
      state,
      city,
      zipcode,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      street: Yup.string(),
      number: Yup.string().when('street', (street, field) =>
        street ? field.required() : field
      ),
      complement: Yup.string(),
      state: Yup.string().when('street', (street, field) =>
        street ? field.required() : field
      ),
      city: Yup.string().when('street', (street, field) =>
        street ? field.required() : field
      ),
      zipcode: Yup.string().when('street', (street, field) =>
        street ? field.required() : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const recipient = await Recipient.findByPk(req.params.id);

    await recipient.update(req.body);

    return res.json({ message: 'Recipient has been updated!' });
  }
}

export default new RecipientController();
