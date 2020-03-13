import Problem from '../models/Problem';
import Order from '../models/Order';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import Mail from '../../lib/Mail';

class ProblemController {
  async index(req, res) {
    const orderId = await Problem.findAll({
      where: { order_id: req.params.id },
    });

    if (!orderId) {
      return res.json
        .status(400)
        .json({ error: 'There is no problems in this order' });
    }

    console.log(orderId);

    return res.json(orderId);
  }

  async store(req, res) {
    const orderId = await Order.findByPk(req.params.id);

    if (!orderId) {
      return res.status(400).json({ error: 'Invalid order id' });
    }

    const { description } = req.body;

    const problem = await Problem.create({
      order_id: req.params.id,
      description,
    });

    return res.json(problem);
  }

  async update(req, res) {
    const orderId = await Order.findByPk(req.params.id);

    if (!orderId) {
      return res.status(400).json({ error: 'Invalid order id' });
    }

    const deliveryman = await Deliveryman.findByPk(orderId.deliveryman_id);

    const recipient = await Recipient.findByPk(orderId.recipient_id);

    await orderId.update({ canceled_at: new Date() });

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'An Order has been canceled!',
      template: 'cancels',
      context: {
        deliveryman: deliveryman.name,
        product: orderId.product,
        recipientName: recipient.name,
        recipientStreet: recipient.street,
        recipientNumber: recipient.number,
        recipientCity: recipient.city,
        recipientState: recipient.state,
      },
    });

    return res.json(orderId);
  }
}

export default new ProblemController();
