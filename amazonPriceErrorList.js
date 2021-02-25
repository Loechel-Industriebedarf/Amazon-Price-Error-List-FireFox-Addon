/*
* https://sellercentral.amazon.de/inventory?viewId=PRICEALERTS
*
* This script downloads a list of all price alerts ("Warnungen vor Preisfehlern prüfen") on your Amazon seller account.
* To execute it, go to https://sellercentral.amazon.de/inventory?viewId=PRICEALERTS (or your language equivalent) and copy-paste the script into the developers console of your browser. Then you just have to wait, until the download is ready.
*/


var artnr = ""; //Global variable that stores the skus/article numbers.

/*
* This function is used to click the "next" button.
*/
function eventFire(el, etype){
  if (el.fireEvent) {
    el.fireEvent('on' + etype);
  } else {
    var evObj = document.createEvent('Events');
    evObj.initEvent(etype, true, false);
    el.dispatchEvent(evObj);
  }
}

/*
* This function opens a download dialoge for the list of skus we create.
*/
function downloadFile(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

/*
* Main function
* Checks, if we are on the last page. If not, go to the next page.
* At every page, call another function to add all skus to string.
*/
function getArtNrs(){
	var currentpage = parseInt(document.getElementById("myitable-gotopage").value); //Get current pagenumber
	
	//Get maximum page number; Remove unneccessary strings and convert the number to int
	//Currently only German and English are supported. Edit this line to add support for different languages. You just need to know the equavilent of "of" in your language.
	var maxpages = parseInt(document.getElementsByClassName("mt-totalpagecount")[0].innerHTML.replaceAll(' ', '').replaceAll('von', '').replaceAll('of', '').replaceAll('\t', '').replaceAll('\n', ''));
	
	//If there is another page left, open it after 5 seconds, give it 2.5 seconds to load and download the skus then.
	if(currentpage < maxpages){
		setTimeout(function(){ 
			eventFire(document.querySelectorAll("a[href='#next']")[0], 'click'); //Go to the next page
			addArtNrsToString(); //Add skus to string
			
			setTimeout(function(){ 
				getArtNrs(artnr); //After a delay execute this function again.
			}, 2500);
		}, 5000);
	}
	else{
		addArtNrsToString(); //Add skus to string
		
		setTimeout(function(){ 
			downloadFile("amazonPriceErrorList.txt", artnr); //Download the file after 2.5 seconds of wait time.
		}, 2500);	
	}
	
	
}

/*
* This function adds all skus on the page to our string, so we can download them lager as .txt file.
*/
function addArtNrsToString(){
	var tempnr = "";
	var skucheck = "";

		//Check how many links are on the page and cycle throught them
		for(var i = 0; i < document.querySelectorAll('.mt-link-content').length; i++){
			skucheck = document.getElementsByClassName('mt-link-content')[i].href;
			//If the link contains "mSku" it is a sku and not the productname or the shipping name
			//If it's a sku, add them to our string. Also remove unneccessary spaces/newlines and add a new line at the end of it.
			if(skucheck.includes("mSku")){
				tempnr = document.getElementsByClassName('mt-link-content')[i].innerHTML;
				tempnr = tempnr.replaceAll(' ', '').replaceAll('\n', '') + '\n';
				artnr = artnr + tempnr;
			}
		}
}



//Call the main function and start the script.
getArtNrs();