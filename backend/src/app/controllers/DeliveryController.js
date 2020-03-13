import { Op } from 'sequelize';
import { startOfDay, endOfDay, isBefore, isAfter } from 'date-fns';
import Order from '../models/Order';
import Signature from '../models/Signature';

class DeliveryController {
  async index(req, res) {
    const listOrders = await Order.findAll({
      where: {
        [Op.and]: [
          { deliveryman_id: req.params.id },
          { start_date: null },
          { canceled_at: null },
        ],
      },
    });

    return res.json(listOrders);
  }

  async withdraw(req, res) {
    const withdrawOrder = await Order.findByPk(req.params.id);

    if (!withdrawOrder) {
      return res.status(400).json({ error: 'Order does not exist' });
    }

    const date = new Date();

    const hours = date.getHours();

    const dayStart = startOfDay(date);

    const dayEnd = endOfDay(date);

    if (isBefore(hours, 8)) {
      return res.json({
        error: 'You can only withdraw orders between 8AM - 18PM',
      });
    }

    if (isAfter(hours, 17)) {
      return res.json({
        error: 'You can only withdraw orders between 8AM - 18PM',
      });
    }

    const limitOrders = await Order.findAll({
      where: {
        deliveryman_id: withdrawOrder.deliveryman_id,
        start_date: {
          [Op.between]: [dayStart, dayEnd],
        },
      },
    });

    if (limitOrders.length >= 50) {
      return res.json({ error: 'You have already reached your daily limit' });
    }

    await withdrawOrder.update({ start_date: new Date() });

    return res.json(withdrawOrder);
  }

  async delivery(req, res) {
    const delivery = await Order.findByPk(req.params.id);

    if (!delivery) {
      return res.status(400).json({ error: 'Wrong order ID' });
    }

    const { signature_id } = req.body;

    const checkSignature = await Signature.findByPk(signature_id);

    if (!checkSignature) {
      return res.status(400).json({ error: 'Signature does not exist' });
    }

    await delivery.update({ end_date: new Date(), signature_id });

    return res.json(delivery);
  }
}

export default new DeliveryController();
