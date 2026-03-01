const OpenAI = require('openai');
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

const SELF_PRONOUNS = [
    "tôi", "mình", "tao", "t", "em", "anh", "tui", "i",
  ]
  
  const GROUP_PRONOUNS = [
    "mọi người",
    "tất cả",
    "bọn tao",
    "tụi tao",
    "tụi mình",
    "cả team",
    "anh em",
    "all",
    "everyone"
  ]

class ChatBotService {
    async extractQuery(question, currentUser = null) {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            response_format: { type: 'json_object' },
            messages: [
                {
                    role: 'system',
                    content: `
      Phân tích câu hỏi và trả JSON:
      Thời gian hiện tại: ${new Date().toISOString()}
      Danh sách user: [
        {
          "name": "Hưng",
          "user_name": "hunghoang"
        },
        {
          "name": "Long",
          "user_name": "longng"
        },
        {
          "name": "Ngọc",
          "user_name": "ngocnd"
        },
        {
          "name": "Dũng",
          "user_name": "dungnt"
        },
        {
          "name": "Vương",
          "user_name": "vuongnv"
        },
        {
          "name": "Tú",
          "user_name": "tule"
        }
      ]
      {
        "intent": "total_amount" | "total_payment" | "total_debit",
        "scope": "self" | "group" | "specific" | "multi",
        "user_names": string[] | null,
        "day": number | null,
        "month": number | null,
        "year": number | null,
      }
      
      Dựa vào name trong danh sách user và trả về user_name vào list user_names
      
      Với intent: 
        total_amount (dành cho câu hỏi liên quan đến tổng tiền đã chi), 
        total_payment (liên quan đến tổng tiền đã thanh toán), 
        total_debit (liên quan đến câu hỏi về dư nợ)
      Nếu câu hỏi về total_amount và  không nhập tháng => lấy tháng hiện tại, còn lại trả về null
      Nếu câu hỏi về total_amount và không nhập năm => lấy năm hiện tại, còn lại trả về null
      Chỉ JSON.
      `
                },
                { role: 'user', content: question }
            ]
        })

        return JSON.parse(response.choices[0].message.content)
    }
}

module.exports = new ChatBotService();