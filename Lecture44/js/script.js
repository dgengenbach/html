// Default values
// var serverIP = resultInput.;


var serverIP = document.getElementByID(resultInput);
serverIP = serverIP || "Enter C360 Server IP";
function orderChickenWith(sideDish) {
  sideDish = sideDish || "whatever!";
  console.log("Chicken with " + sideDish);
}

orderChickenWith("noodles");
orderChickenWith();
