import * as Yup from 'yup';

import Order from '../models/Order';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import Mail from '../../lib/Mail';

class OrderController {
  async index(req, res) {
    const listOrders = await Order.findAll();

    return res.json(listOrders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      signature_id: Yup.string(),
      product: Yup.string().required(),
      canceled_at: Yup.date(),
      start_date: Yup.date(),
      end_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const deliveryman = await Deliveryman.findByPk(req.body.deliveryman_id);

    const recipient = await Recipient.findByPk(req.body.recipient_id);

    const { id, recipient_id, deliveryman_id, product } = await Order.create(
      req.body
    );

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'New order to delivery!',
      template: 'orders',
      context: {
        deliveryman: deliveryman.name,
        product: req.body.product,
        recipientName: recipient.name,
        recipientStreet: recipient.street,
        recipientNumber: recipient.number,
        recipientCity: recipient.city,
        recipientState: recipient.state,
      },
    });

    return res.json({
      id,
      recipient_id,
      deliveryman_id,
      product,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number(),
      deliveryman_id: Yup.number(),
      signature_id: Yup.string(),
      product: Yup.string(),
      canceled_at: Yup.date(),
      start_date: Yup.date(),
      end_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(400).json({ error: 'Invalid Order ID' });
    }

    await order.update(req.body);

    return res.json({ message: 'Order has been updated! ' });
  }

  async delete(req, res) {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(400).json({ error: 'Order ID does not exist!' });
    }

    await order.destroy();

    return res.json({ message: 'The order has been removed!' });
  }
}

export default new OrderController();
