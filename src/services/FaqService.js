
const FAQ_DATA = [
  {
    id: '1',
    category: 'General',
    question: 'What is Passr?',
    answer: 'Passr is a campus marketplace exclusive to university students. It allows you to buy and sell items safely within your campus community.'
  },
  {
    id: '2',
    category: 'General',
    question: 'Who can use Passr?',
    answer: 'Currently, Passr is open to students with a valid university email address (.edu).'
  },
  {
    id: '3',
    category: 'Selling',
    question: 'How do I list an item?',
    answer: 'Go to the "Sell" tab, take photos of your item, add a description and price, and publish. It takes less than a minute!'
  },
  {
    id: '4',
    category: 'Selling',
    question: 'Are there fees for selling?',
    answer: 'Listing items is free. We charge a small service fee only when your item sells.'
  },
  {
    id: '5',
    category: 'Buying',
    question: 'How do I make an offer?',
    answer: 'When viewing an item, tap the "Make Offer" button. You can suggest a price and start a negotiation with the seller.'
  },
  {
    id: '6',
    category: 'Buying',
    question: 'Is it safe to meet up?',
    answer: 'We recommend meeting in public places on campus, such as student unions, libraries, or designated safe exchange zones.'
  },
  {
    id: '7',
    category: 'Account',
    question: 'How do I reset my password?',
    answer: 'Go to the Login screen and tap "Forgot Password". We will send you a reset link to your registered email.'
  },
  {
    id: '8',
    category: 'Account',
    question: 'Can I change my university?',
    answer: 'Your account is tied to your university email. If you transfer, you will need to register a new account with your new email.'
  }
];

class FaqService {
  async getFaqs() {
    // Simulate API call
    return Promise.resolve(FAQ_DATA);
  }

  async getFaqsByCategory(category) {
    const filtered = FAQ_DATA.filter(item => item.category === category);
    return Promise.resolve(filtered);
  }
}

export const faqService = new FaqService();
