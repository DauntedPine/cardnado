import { validateStore } from "../../common/cardValidator";
import { CardDetails } from "../../common/models";
import constants from "./constants";
import { resetInfo, setInfo } from "./utils";

declare var JsBarcode: any;
var currentCardNumber = '';
const reportCardButton = $('#report-card');
const refreshButton = $('#refresh-card');
const storeSelector = $('#store-selector');

function getSoreAndCard(): CardDetails {
    return {
        cardNumber: currentCardNumber,
        store: storeSelector.val() as string
    };
}

function setBarcodeWidth() {
    $('#barcode').attr('width', '100%');
}

function generateBarcode(store: string) {
    $.get(constants.getCardUrl, { "store": store })
        .done(function (data) {
            JsBarcode("#barcode", data.id);
            currentCardNumber = data.id;
            setBarcodeWidth();
            resetInfo();
        })
        .fail(function (data) {
            setInfo(data.responseJSON.message, 'warning');

        }).always(() => { $('#get-card').removeClass('disabled'); });
}


function getCard() {
    setInfo('Please wait...', 'default');
    $('#get-card').addClass('disabled');
    const store = storeSelector.val() as string;
    if (!validateStore(store)) {
        setInfo('Invalid store selected', 'warning');
    }
    generateBarcode(store);
}

function reportCard() {
    reportCardButton.addClass('disabled');
    setInfo('Please wait...', 'default');

    const cardDetails = getSoreAndCard();
    $.post(constants.reportCardUrl, cardDetails)
        .done(function () {
            getCard();
            setInfo(`Card reported. A new one has been generated`, 'success');
        })
        .fail(function (data) {
            setInfo(data.responseJSON.message, 'warning');
        }).always(() => { reportCardButton.removeClass('disabled'); });
}

$(function () {
    getCard();
    storeSelector.on('change', function () {
        getCard();
    });
    refreshButton.on('click', () => { getCard(); });
    reportCardButton.on('click', () => { reportCard(); });
});




