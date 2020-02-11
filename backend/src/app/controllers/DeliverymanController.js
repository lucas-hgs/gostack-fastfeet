import * as Yup from 'yup';

import Deliveryman from '../models/Deliveryman';
import Avatar from '../models/Avatar';

class DeliverymanController {
  async index(req, res) {
    const listDeliverymen = await Deliveryman.findAll({
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: [
        {
          model: Avatar,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
      order: ['id'],
    });

    return res.json(listDeliverymen);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const deliverymanExists = await Deliveryman.findOne({
      where: { email: req.body.email },
    });

    if (deliverymanExists) {
      return res
        .status(400)
        .json({ error: 'Deliveryman is already registered' });
    }

    const { id, name, email } = await Deliveryman.create(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      avatar_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const deliveryman = await Deliveryman.findByPk(req.params.id);

    await deliveryman.update(req.body);

    return res.json({ message: 'Deliveryman has been updated!' });
  }

  async delete(req, res) {
    const deliveryman = await Deliveryman.findByPk(req.params.id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exist' });
    }

    await deliveryman.destroy();

    return res.json({ message: 'Deliveryman has been deleted!' });
  }
}

export default new DeliverymanController();
