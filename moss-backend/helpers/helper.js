const COLOR_UNIMPORTANT = "#28a745"
const COLOR_IMPORTANT = "#dc3545"
const COLOR_NORMAL = "#ffc107"

module.exports = {
  getBorderColor: function(priority) {
    switch(priority) {
      case "NOT_IMPORTANT":
        return COLOR_UNIMPORTANT;
      case "MOST_IMPORTANT":
        return COLOR_IMPORTANT;
      case "NORMAL":
        return COLOR_NORMAL;
      default:
        return COLOR_IMPORTANT;
    }
  }
}