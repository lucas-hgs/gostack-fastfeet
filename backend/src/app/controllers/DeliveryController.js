import { Op } from 'sequelize';
import Order from '../models/Order';

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
}

export default new DeliveryController();
