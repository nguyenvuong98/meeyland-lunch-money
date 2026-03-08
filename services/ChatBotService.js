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
  async answerDebit(data = []) {
    if (!data?.length) return '';

    let template = ``
    data.forEach(item => {
      template += `Tên: ${item.userName}, totalAmount: ${item.totalAmount}, totalPayment: ${item.totalPayment}, debit: ${Math.abs(item.debit)}, status=${item.debit >= 0 ? '0' : '1'}\n`;
    })

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `
              Bạn là chủ nợ 
              Dựa vào câu hỏi của người dùng có dạng:
              - name: vuongnv, totalAmount: 10000, totalPayment: 90000, debit: -10000
              
              Với:
                vuongnv là tên người dùng
                totalAmount là tổng tiền vuongnv đã ứng trước, đã tiêu, đã dành cho việc ăn uống
                totalPayment là tổng tiền vuongnv đã trả, đã thanh toán
                debit là tiền còn thiếu, dư nợ, cao su của vuongnv
                status=(1|0) với status = 0 là  đủ hoặc thừa => nên được khen, status = 1 thì phải mỉa mai (debit lớn hơn 200000 thì mức độ mỉa mai phải thật lớn)
              
              Trả về đoan text với 4 thông tin tên, totalAmount, totalPayment, debit 
              (các thông tin về totalAmount, totalPayment, debit viết bên trong cặp <code></code> để nguyên số không cần chỉnh sửa lại)
              (thông tin về name viết bên trong cặp <b></b> và đừng xóa ký tự '@' nếu có)
              (Có thể có nhiều người trong thông tin câu hỏi,hãy trả lời đầy đủ số người với ngôn ngữ tự nhiên nhất)
            `
        },
        {
          role: 'user',
          content: template
        }
      ]
    })

    return response.choices[0].message?.content
  }
  async extractPaymentQuery(question, currentUser) {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `
            Phân tích câu hỏi và trả JSON:
            Thời gian hiện tại: ${new Date().toISOString()}
        Người dùng hiện tại: ${currentUser}
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
          "intent": "payment",
          "paymentInfo": [
            {
              user_name: string | null,
              payment: number | 0
            }
          ],
        }
        Dựa vào câu hỏi trả về paymentInfo (là một danh sách) với tên người và số lượng tiền thanh toán tương ứng (nếu không tìm thấy thông tin người thì lấy Người dùng hiện tại)
        VD:
          input: Long gà đã thanh toán 10000vnd
          output: 
            {
              "intent": "payment",
              "paymentInfo": [
                {
                  user_name: 'longng',
                  payment: 10000
                }
              ],
            }

          input: Long  gà  và ngocnd đã thanh toán 150000
          output: 
            {
              "intent": "payment",
              "paymentInfo": [
                {
                  user_name: 'longng',
                  payment: 150000
                },
                {
                  user_name: 'ngocnd',
                  payment: 150000
                }
              ],
            }

          input: Long  gà   đã thanh toán 150000, ngocnd thanh toán 2000
          output: 
            {
              "intent": "payment",
              "paymentInfo": [
                {
                  user_name: 'longng',
                  payment: 150000
                },
                {
                  user_name: 'ngocnd',
                  payment: 2000
                }
              ],
            }
            Chỉ JSON.
          `,
        },
        { role: 'user', content: question }
      ]
    })

    return JSON.parse(response.choices[0].message.content)
  }
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
      Người dùng hiện tại: ${currentUser}
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
        "filterRange": 0 | 1,
      }
      
      Dựa vào name trong danh sách user và trả về user_name vào list user_names
      
      Với intent: 
        total_amount (dành cho câu hỏi liên quan đến tổng tiền đã chi), 
        total_payment (liên quan đến tổng tiền đã thanh toán), 
        total_debit (liên quan đến câu hỏi về dư nợ)

      Nếu câu hỏi không nhập ngày => trả null
      Nếu câu hỏi không nhập tháng => lấy tháng hiện tại, còn lại trả về null
      Nếu câu hỏi không nhập năm => lấy năm hiện tại, còn lại trả về null
      Với filterRange:
        nếu người dùng hỏi có chỉ trong 1 ngày chỉ định trả về 0 (hôm qua, hôm nay, hôm trước, ngày thứ hai, ngày 3 tháng....)
        còn lại trả về 1
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