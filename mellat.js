/**
 * Node.js Mellat Gatewat • Simple implementation of Mellat Gatewat Node.js. so you can quickly start using API.
 * @author Armin Khodaei <awrminkhodaei@gmail.com>
 * @date 06/02/20.
 */

/**
 * Constructor for MellatCheckout class.
 * @param {Object} config
 * @param {Object} soap
 */
class MellatCheckout {
  constructor(config, soap) {
    this.config = config;
    this.soap = soap;
  }
  /**
   * Get payment token from bank
   * @param {Number} amount [amount on rials]
   * @param {Number} userId [user's id on your database]
   * @param {Number} orderId [unique order_id on your database]
   * @returns {Promise} Promis object of bank result
   */
  requestPayment(amount, userId, orderId) {
    try {
      return new Promise((resolve, reject) => {
        const wsdl = this.config.wsdlUrl;

        const args = {
          terminalId: this.config.terminalId, // your mellat account terminal id
          userName: this.config.userName, // your mellat account user name
          userPassword: this.config.password, // your mellat account password
          orderId: orderId,
          amount: amount,
          localDate: this.getLocalDate(),
          localTime: this.getLocalTime(),
          additionalData: "",
          callBackUrl: this.config.callBackUrl,
          payerId: userId,
        };

        this.soap.createClientAsync(wsdl).then((client) => {
          if (!client) throw "couldnt stablish connection with bank";
          client.bpPayRequest(args, (err, result) => {
            if (err) throw err;
            if (result.return) {
              // check if request was successful
              const gatewayStatus = result.return.split(",")[0];
              if (gatewayStatus == 0) {
                resolve({
                  status: true,
                  token: result.return.split(",")[1],
                  order_id: args.orderId,
                });
              } else {
                reject({ status: false, code: gatewayStatus });
              }
            }
          });
        });
      });
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * helper function to convert persian digits in string to english digits
   * some OS returns numbers in persian so you can use this function to covnert them
   * @param {number} number
   * @returns {number}
   */
  toEnglishDigits(number) {
    return number.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
  }

  /**
   * helper function to return current date
   * example: 20200602
   * @param {string} date
   * @returns {string}
   */
  formatDate(date) {
    (month = "" + (date.getMonth() + 1)),
      (day = "" + date.getDate()),
      (year = date.getFullYear());

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("");
  }

  /**
   * helper function to return current date
   * example: 20200602
   * @returns {string}
   */
  getLocalDate() {
    return this.formatDate(new Date());
  }
  /**
   * helper function to return current time in hh::mm::ss
   * example: 162930
   * @returns {string}
   */
  getLocalTime() {
    return this.toEnglishDigits(
      new Date()
        .toLocaleTimeString("fa-IR", { hour12: false })
        .replace(/:/g, "")
    );
  }
}
module.exports = MellatCheckout;
