<template>
    <v-toolbar
        class = "reports-navigator__header pa-0"
        color = "primary"
    >
        <v-flex
            class = "reports-navigator__warehouse-name white--text"
        >
            <span
                class = "icon-storekeeper icon-storekeeper-pin"
                v-if  = "warehouseName"
            ></span>
            {{ warehouseName }}
        </v-flex>

        <!-- From -->
        <v-flex
            class = "mr-5"
            xs4
            sm4
            md2
        >
            <v-menu
                v-model                 = "datePickerFrom"
                :close-on-content-click = "true"
                :nudge-right            = "40"
                min-width               = "200px"
                offset-y
                full-width
                lazy
                light
            >
                <v-text-field
                    class        = "pa-0 white--text"
                    slot         = "activator"
                    v-model      = "formattedFrom"
                    placeholder  = "From"
                    prepend-icon = "event"
                    color        = "white"
                    dark
                    hide-details
                    readonly
                ></v-text-field>

                <v-date-picker 
                    v-model = "dateFrom"
                    color   = "primary"
                    @change = "changeDate"
                ></v-date-picker>
            </v-menu>
        </v-flex>

        <!-- To -->
        <v-flex xs4 sm4 md2>
            <v-menu
                v-model                 = "datePickerTo"
                :close-on-content-click = "true"
                :nudge-right            = "40"
                min-width               = "200px"
                offset-y
                full-width
                lazy
                light
            >
                <v-text-field
                    class        = "pa-0 white--text"
                    slot         = "activator"
                    v-model      = "formattedTo"
                    placeholder  = "To"
                    prepend-icon = "event"
                    color        = "white"
                    dark
                    hide-details
                    readonly
                ></v-text-field>

                <v-date-picker
                    v-model = "dateTo"
                    color   = "primary"
                    @change = "changeDate"
                ></v-date-picker>
            </v-menu>
        </v-flex>

        <v-spacer></v-spacer>

        <!-- Download button -->
        <v-menu 
            :disabled = "this.currentReportData.length ? !this.currentReportData.length : true"
            light
            offset-y
        >
            <v-btn 
                color     = "secondary" 
                slot      = "activator"
                :disabled = "this.currentReportData.length ? !this.currentReportData.length : true"
            > 
                <v-icon left> cloud_download </v-icon>
                Download
            </v-btn>
            <v-list>
                <v-list-tile
                    v-for  = "(formatItem, index) in typeOfFormatReport"
                    :key   = "index"
                    @click = "chooseFormatReprots(formatItem)"
                >
                <v-list-tile-title>{{ formatItem }}</v-list-tile-title>
            </v-list-tile>
        </v-list>
       </v-menu>
    </v-toolbar>
</template>

<script>
    import { mapMutations, mapActions, mapState } from 'vuex';
    import JsPDF from 'jspdf';
    import XLSX from 'xlsx';
    import 'jspdf-autotable';

    import BaseDialog from '@/components/dialog/BaseDialog.vue';

    export default {
        components: { BaseDialog },
        data() {
            return {
                dateFrom           : '',
                dateTo             : '',
                datePickerFrom     : '',
                datePickerTo       : '',
                formattedFrom      : '',
                formattedTo        : '',
                dataForReportExcel : [],
                typeOfFormatReport : [ '.xlsx', '.pdf' ],
                states             : [ 'new', 'damaged', 'used', 'restored' ]
            };
        },
        computed: {
            ...mapState('reports/reports', [
                'warehouseName',
                'currentReportData',
                'currentTotalData',
                'currentActiveReport',
                'base64TextRowIcon',
                'base64TextLocationsIcon',
                'base64TextTimeIcon'
            ]),
             ...mapState('auth', [
                'userProfile'
            ])
        },
        methods: {
            ...mapMutations('reports/reports', [
                'setDate',
                'fillUpReportData'
            ]),
            ...mapActions('reports/reports', [
                'generateReport'
            ]),

            changeDate() {
                let date = {
                    from : this.dateFrom,
                    to   : this.dateTo
                };

                if (date.to) {
                    let dateTo = new Date(date.to);

                    dateTo.setDate(dateTo.getDate() + 1);

                    let day   = (dateTo.getDate().toString()).padStart(2, '0');
                    let month = ((dateTo.getMonth() + 1).toString()).padStart(2, '0');
                    let year  = dateTo.getFullYear();

                    date.to = `${ year }-${ month }-${ day }`;

                    if (dateTo >= new Date()) {
                        this.showInfoSnackbar('The current day is not completed, the report will not be complete');
                    }
                }

                date.from = date.from
                    ? date.from = new Date(date.from).toISOString()
                    : undefined;
                
                date.to = date.to
                    ? date.to = new Date(date.to).toISOString()
                    : undefined;

                this.parsingDate();
                this.setDate(date);
                this.fillUpReportData();
                this.generateReport();
            },
            parsingDate() {
                let [ fromYear, fromMonth, fromDay ] = this.dateFrom.split('-');
                let [ toYear, toMonth, toDay ] = this.dateTo.split('-');

                if (fromYear) {
                    this.formattedFrom = `${ fromMonth }-${ fromDay }-${ fromYear }`;
                }

                if (toYear) {
                    this.formattedTo = `${ toMonth }-${ toDay }-${ toYear }`;
                }
            },
            inicializationTableForPdfReport() {
                let objDataForReports = {};
                let arrayObjDataForReports = [];
                let arrayTotal = [];

                this.currentReportData.forEach(currentReportData => {
                    objDataForReports = [
                        currentReportData.partName,
                        currentReportData.partNumber,
                        this.getPartState(currentReportData.partState),
                        this.convertToNumbersWithSpace(currentReportData.countBegin),
                        this.convertToNumbersWithSpace(currentReportData.countReceived),
                        this.convertToNumbersWithSpace(currentReportData.countSpent),
                        this.convertToNumbersWithSpace(currentReportData.countEnd), 
                        this.convertToPrice(currentReportData.priceBegin),
                        this.convertToPrice(currentReportData.priceReceived),
                        this.convertToPrice(currentReportData.priceSpent),
                        this.convertToPrice(currentReportData.priceEnd)
                    ];

                    arrayObjDataForReports.push(objDataForReports);
                });

                 arrayTotal = [
                    'Total:',
                    '',
                    '',
                    this.convertToNumbersWithSpace(this.currentTotalData.countBegin),
                    this.convertToNumbersWithSpace(this.currentTotalData.countReceived),
                    this.convertToNumbersWithSpace(this.currentTotalData.countSpent),
                    this.convertToNumbersWithSpace(this.currentTotalData.countEnd),
                    this.convertToPrice(this.currentTotalData.priceBegin),
                    this.convertToPrice(this.currentTotalData.priceReceived),
                    this.convertToPrice(this.currentTotalData.priceSpent),
                    this.convertToPrice(this.currentTotalData.priceEnd)
                ];

                arrayObjDataForReports.push(arrayTotal);

                return arrayObjDataForReports;
            },
            generateReportFilePdf() {
                let doc     = new JsPDF('l');   
                let columns = [ 'part name', 'part number',    'part state',       'begin',    'received',    'spent', 
                                'end',        'begin',          'received',         'spent',    'end' ];
                let arrayObjDataForReports      = this.inicializationTableForPdfReport();
                let nameFile                    = `Parts turnover, ${ this.warehouseName }, from ${ this.formattedFrom } to ${ this.formattedTo }.pdf`;
                let { warehouseName }           = this;
                let currentActiveReport         = this.currentActiveReport.name;
                let dateFrom                    = this.formattedFrom;
                let dateTo                      = this.formattedTo;
                let creator                     = `${ this.userProfile.firstName }\n${ this.userProfile.lastName }`;
                let currentDate                 = this.returnCurrentDate();
                let { base64TextRowIcon }       = this;
                let { base64TextLocationsIcon } = this;
                let { base64TextTimeIcon }      = this;
                // marginTL - margin title (under table) left 
                let pageContent = function (data) { 
                    let marginTL = {
                        wareHouseName : 105,
                        dateFrom      : 5,
                        dateTo        : 6,
                        creator       : 240,
                        currentDate   : 23
                    };
                    let marginLeftNumberOfPage = {
                        marginLeft   : 276,
                        marginBottom : 8
                    };
                    let marginAndDataImg = {
                        marginLeft : 5,
                        marginTop  : 5,
                        width      : 4,
                        height     : 4
                    };
                    let marginTopTitle = 6.7;
                    let marginWareHouseName = data.settings.margin.left + marginTL.wareHouseName;
                    let marginDateFrom      = marginWareHouseName + 
                                              marginTL.dateFrom + (warehouseName.length * 2);
                    let marginDateTo        = marginDateFrom + marginTL.dateTo + 
                                              (dateTo.length * 2);
                    let marginCreator       = data.settings.margin.left + marginTL.creator;
                    let marginCurrentDate   = marginCreator + marginTL.currentDate;
                    let numberOfPage        = String(doc.internal.getNumberOfPages());

                    doc.setFontSize(9); 
                    doc.setTextColor(40); 
                    doc.setFontStyle('normal');
                    // first param - text, second and third - properties like margin
                    doc.text(currentActiveReport, data.settings.margin.left + 7, marginTopTitle); 
                    doc.text(warehouseName, marginWareHouseName, marginTopTitle);
                    doc.text(dateFrom, marginDateFrom, marginTopTitle);
                    doc.text(dateTo, marginDateTo, marginTopTitle);
                    doc.text(creator, marginCreator, marginTopTitle);
                    doc.text(currentDate, marginCurrentDate, marginTopTitle);
                    doc.text(numberOfPage, 
                            data.settings.margin.left + marginLeftNumberOfPage.marginLeft, 
                            doc.internal.pageSize.height - marginLeftNumberOfPage.marginBottom, 'right');
                     /* first param - base64 image, second - type of image, 
                     others - properties( marginLeft, marginTop, width, height) */
                    doc.addImage(base64TextRowIcon, 'PNG', 
                        marginAndDataImg.marginLeft + 3, 
                        marginAndDataImg.marginTop - 0.8, 
                        marginAndDataImg.width, 
                        marginAndDataImg.height - 1);
                    doc.addImage(base64TextLocationsIcon, 'PNG', 
                        marginWareHouseName - marginAndDataImg.marginLeft, 
                        marginAndDataImg.marginTop - 1, 
                        marginAndDataImg.width, 
                        marginAndDataImg.height);
                    doc.addImage(base64TextTimeIcon, 'PNG', 
                        marginDateFrom - marginAndDataImg.marginLeft, 
                        marginAndDataImg.marginTop - 1.2, 
                        marginAndDataImg.width, 
                        marginAndDataImg.height);
                    doc.addImage(base64TextTimeIcon, 'PNG', 
                        marginDateTo - marginAndDataImg.marginLeft, 
                        marginAndDataImg.marginTop - 1.2, 
                        marginAndDataImg.width, 
                        marginAndDataImg.height);
                }; 

                doc.autoTable({
                    head   : [ columns ],
                    body   : arrayObjDataForReports,
                    margin : { top: 15, left: 7 },
                    styles : { 
                        halign    : 'center', 
                        cellWidth : 1, 
                        lineColor : [ 229, 229, 229 ] 
                    },
                    headStyles: { 
                        fillColor     : [ 1, 150, 186 ], 
                        fontSize      : 9, 
                        fontStyle     : 'normal', 
                        minCellHeight : 13, 
                        textColor     : [ 255, 255, 255 ], 
                        lineWidth     : 0.1, 
                        lineColor     : [ 229, 229, 229 ]
                    },
                    bodyStyles   : { fontSize: 7, fontStyle: 'normal' },
                    theme        : 'grid',
                    didDrawPage  : pageContent,
                    columnStyles : {
                        0  : { cellWidth: 25, halign: 'left' },
                        1  : { cellWidth: 25, halign: 'left' },
                        2  : { cellWidth: 12 },
                        3  : { cellWidth: 13 },
                        4  : { cellWidth: 17 },
                        5  : { cellWidth: 14 },
                        6  : { cellWidth: 13 },
                        7  : { cellWidth: 23, halign: 'right' },
                        8  : { cellWidth: 23, halign: 'right' },
                        9  : { cellWidth: 23, halign: 'right' },
                        10 : { cellWidth: 23, halign: 'right' }
                    },
                    didParseCell: data => {
                        let isFirstCellAndSectionHead = (data.section === 'head') && ([ 0, 1 ].includes(Number(data.column.index)));
                       
                        if (isFirstCellAndSectionHead) {
                            data.cell.styles.halign = 'left';
                        }

                        let isLastCellAndSectionHead = (data.section === 'head') && ([ 7, 8, 9, 10 ].includes(Number(data.column.index)));

                        if (isLastCellAndSectionHead) {
                            data.cell.styles.halign = 'right';
                        }

                        let isEvenRowAndSectionBody = data.section === 'body' && data.row.index % 2 === 0;

                        if (isEvenRowAndSectionBody) {   
                            data.cell.styles.fillColor = '#F9F9F9';
                        }
                        
                       if (data.row.index === arrayObjDataForReports.length - 1) {
                            data.cell.styles.fillColor = '#EBF9FD';
                        }
                    }
                 });

                doc.save(nameFile);
            },
            returnCurrentDate() {
                let currentDate = new Date();
                let day   = (currentDate.getDate().toString()).padStart(2, '0');
                let month = ((currentDate.getMonth() + 1).toString()).padStart(2, '0');
                let year  = currentDate.getFullYear() - 2000;

                currentDate = `${ month }-${ day }-${ year }`;
                
                return currentDate;
            },
            convertToPrice(price) {
                let result    = Math.floor(price / 100);
                let remainder = (price % 100).toString().padStart(2, '0');

                if (result >= 1000) {
                    let resultStr = String(result);
                    resultStr = resultStr.replace(/(\d{1,3})(?=((\d{3})*([^\d]|$)))/g, ' $1');
                    return `$ ${ resultStr },${ remainder }`;
                }

                return `$ ${ result },${ remainder }`;
            },
            convertToPriceExcel(price) {
                let result    = Math.floor(price / 100);
                let remainder = (price % 100).toString().padStart(2, '0');

                return `${ result }.${ remainder }`;
            },
            convertToNumbersWithSpace(number) {
                if (number >= 1000) {
                    let resultStr = String(number);
                    resultStr = resultStr.replace(/(\d{1,3})(?=((\d{3})*([^\d]|$)))/g, ' $1');
                    return resultStr;
                }

                return number;
            },
            generateReportFileExcel() {
                let objDataForReportExcel      = {};
                let objTotalDataForReportExcel = {};
                let nameFile                   = `Parts turnover, ${ this.warehouseName }, from ${ this.dateFrom } to ${ this.dateTo }.xlsx`;
                let dataExccelWS;
                let wb;

                // console.log('Текущий отчет: ', this.currentActiveReport.name);
                // console.log('Дата формирования отчета: ', this.returnCurrentDate());
                // console.log('Имя человека сформировавший отчет: ', 'Adamovich Artur');

                this.currentReportData.forEach(currentReportData => {
                    objDataForReportExcel = { 
                        'part name'         : currentReportData.partName, 
                        'part #'            : currentReportData.partNumber, 
                        'part state'        : this.getPartState(currentReportData.partState), 
                        'at the begin, qty' : currentReportData.countBegin, 
                        'received, qty'     : currentReportData.countReceived,
                        'spent, qty'        : currentReportData.countSpent, 
                        'at the end, qty'   : currentReportData.countEnd, 
                        'at the begin, $'   : this.convertToPriceExcel(currentReportData.priceBegin), 
                        'received, $'       : this.convertToPriceExcel(currentReportData.priceReceived),
                        'spent, $'          : this.convertToPriceExcel(currentReportData.priceSpent), 
                        'at the end, $'     : this.convertToPriceExcel(currentReportData.priceEnd)
                    };
                    
                    this.dataForReportExcel.push(objDataForReportExcel);
                });
                
                objTotalDataForReportExcel = { 
                    'part name'         : 'Total', 
                    'part #'            : '', 
                    'part state'        : '', 
                    'at the begin, qty' : this.currentTotalData.countBegin, 
                    'received, qty'     : this.currentTotalData.countReceived,
                    'spent, qty'        : this.currentTotalData.countSpent, 
                    'at the end, qty'   : this.currentTotalData.countEnd, 
                    'at the begin, $'   : this.convertToPriceExcel(this.currentTotalData.priceBegin), 
                    'received, $'       : this.convertToPriceExcel(this.currentTotalData.priceReceived),
                    'spent, $'          : this.convertToPriceExcel(this.currentTotalData.priceSpent), 
                    'at the end, $'     : this.convertToPriceExcel(this.currentTotalData.priceEnd)
                };
                
                let maxLengthCell = this.checkMaxLengthCell(this.currentReportData);                
                let wscols = [
                    { wch: maxLengthCell.partNameL },
                    { wch: maxLengthCell.partNumberL },
                    { wch: 9 },
                    { wch: 14 },
                    { wch: 11 },
                    { wch: 11 },
                    { wch: 13 },
                    { wch: 14 },
                    { wch: 14 },
                    { wch: 14 },
                    { wch: 14 }
                ];

                let wsorient = [
                    { orientation: 'landscape' }
                ];
 
                this.dataForReportExcel.push(objTotalDataForReportExcel);
               
                dataExccelWS = XLSX.utils.aoa_to_sheet([ 
                    [ 
                        this.currentActiveReport.name, 
                        this.warehouseName, 
                        'From', this.dateFrom, 
                        'To', this.dateTo, 
                        '', '', 
                        'Adamovich Artur', 
                        this.returnCurrentDate() 
                    ] 
                ]);
                wb           = XLSX.utils.book_new();
                
                dataExccelWS['!cols'] = wscols;
                dataExccelWS['!pageSetup'] = wsorient;

                XLSX.utils.sheet_add_json(dataExccelWS, this.dataForReportExcel, { origin: 1 });
                XLSX.utils.book_append_sheet(wb, dataExccelWS, 'dataForReportExcel');
                XLSX.writeFile(wb, nameFile);
    
                this.dataForReportExcel = [];
            },
            getPartState(stateId) {
                return this.states[stateId - 1];
            },
            chooseFormatReprots(items) {
                switch (items) {
                    case '.xlsx': 
                        this.generateReportFileExcel();
                        break;
                    case '.pdf':
                        this.generateReportFilePdf();
                        break;
                    default:
                        this.showInfoSnackbar('Try again');
                }
            },
            checkMaxLengthCell(currentReportDataObj) {
                let objLength = {
                    partNameL   : 0,
                    partNumberL : 0
                };

                currentReportDataObj.forEach(currentReportData => {
                    if (objLength.partNameL === 0) {
                        objLength.partNameL   = currentReportData.partName.length;
                        objLength.partNumberL = currentReportData.partNumber.length;
                    }

                    if (currentReportData.partName.length > objLength.partNameL) {
                        objLength.partNameL = currentReportData.partName.length;
                    }

                   if (currentReportData.partNumber.length > objLength.partNumberL) {
                        objLength.partNumberL = currentReportData.partNumber.length;
                    }
                });

                return objLength;
            }
        }
    };
</script>

<style lang="scss" scoped>

</style>
