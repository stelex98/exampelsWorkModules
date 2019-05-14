<template>
       <v-container
            class = "main-container ma-0" 
            fluid 
        >
        <v-layout
            class = "container__main-content pl-2"
            justify-center  
            row    
        >
            <v-flex
                class = "main-content__first-column"
                md4
            >
                <p class = "mono5--text">Basic</p>
                <v-layout column>
                    <v-flex
                        class = "first-column__image-cotainer"
                    >
                            <v-img
                                class       = "image-container__image-item"
                                :src        = "(base64Img || ``)"
                                height      = "80px"
                                v-if        = "showImage"                             
                                @mouseenter = "showActionImg = true"
                                contain        
                            ></v-img>
                            <v-flex
                                 v-if        = "showImage === false"
                                 @mouseleave = "showActionImg = false"
                            >
                                <image-loader
                                    class    = "image-container__button-load-image"
                                    :replace = "showActionImg"
                                    :newImg  = "base64Img === null" 
                                ></image-loader>
                            </v-flex>
                    </v-flex>
                
                    <v-flex
                        class = "first-column__text-field pt-4"
                        v-for = "(item, i) in firstColumnInput"    
                        :key  = "`${i}`"
                    >
                         <TextField
                            :name           = "item.name"
                            :rules          = "item.rules"
                            :nameForState   = "item.nameForState"
                            :valueTextField = "item.valueTextField"
                            @globalError    = "checkGlobalError"
                            ref             = "currentTextField"
                        ></TextField>
                    </v-flex>
                </v-layout>
            </v-flex>
            <v-flex 
                class = "main-content__second-column pl-5"
				md4
            >
                <p>Address</p>
				
                <v-layout 
					class = "second-column__input-address-actions pt-4"
					column
				>
					<v-flex  
                        v-for = "(item, i) in secondColumnInput"    
                        :key  = "`${i}`"
                    >
						<TextField
							:name           = "item.name"
							:rules          = "item.rules"
                            :nameForState   = "item.nameForState"
                            :valueTextField = "item.valueTextField"
                            @globalError    = "checkGlobalError"
                            ref             = "currentTextField"
						></TextField>
					</v-flex>

					<v-flex 
                        class = "input-address-actions__select-action-input" 
                        v-for = "(item, i ) in secondColumnSelect"
                        :key  = "`${i}`"
                        dark
                    >
                        <select-field
                            :name         = "item.name"
                            :nameForState = "item.nameForState"
                            :valueSelect  = "item.valueSelect"
                            :dataArray    = "item.dataArray"
                            :rules        = "item.rules"
                            @globalError  = "checkGlobalError"
                            ref           = "currentTextField"
                        ></select-field>
					</v-flex>
				</v-layout>
            </v-flex>
            <v-flex
				class = "main-content__third-column pl-5"
				md4
			>
				<p>Contact</p>

				<v-layout 
					class = "third-column__input-address-actions pt-4"	
					column
				>
					<v-flex  
						v-for = "(item, i ) in thirdColumnInput"
                        :key  = "`${i}`"
					>
						<TextField
							:name           = "item.name"
							:rules          = "item.rules"
                            :nameForState   = "item.nameForState"
                            :valueTextField = "item.valueTextField"
                            @globalError    = "checkGlobalError"
                            ref             = "currentTextField"
						></TextField>
					</v-flex>
				</v-layout>
			</v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    import { mapMutations, mapState } from 'vuex';
    import TextField                  from '@/components/core-text-field/CoreTextField.vue';
    import SelectField                from '@/components/core-text-field/CoreSelect.vue';
    import ImageLoader                from './image-loader/ImageLoader.vue';

    export default {
        components: {
            TextField,
            ImageLoader,
            SelectField
        },
        computed: {
            ...mapState('companyProfile/basic', [ 'objCompanyProfle', 'base64Img', 'countryArray' ])
        },
        mounted() {
            this.checkGlobalError();
        },
        methods: {
            ...mapMutations('companyProfile/basic', [ 'writeSelectCountry' ]),

            checkGlobalError() {
                console.log(this.$refs);
                let errorTextField = Object.values(this.$refs.currentTextField).some(
                    item => item.$v.$invalid === true
                );

                console.log('Global Error:', errorTextField);
            }
        },
        watch: {
            base64Img: function () {
                this.showImage     = true;
                this.showActionImg = false;
            },
            showActionImg: function () {
                if (this.base64Img !== null) {
                    this.showImage = this.showActionImg === false;
                }
            }
        },
        beforeMount() {
            this.firstColumnInput.companyName.valueTextField = this.objCompanyProfle.name;

            this.secondColumnSelect.country.valueSelect  = this.objCompanyProfle.country;
            this.secondColumnSelect.country.dataArray    = this.countryArray;

            Object.values(this.secondColumnInput).forEach(element => {
                element.valueTextField = this.objCompanyProfle[element.nameForState];            
            });

             Object.values(this.thirdColumnInput).forEach(element => {
                element.valueTextField = this.objCompanyProfle[element.nameForState];
            });
        },
        data() {
            return {
                showActionImg : false,
                showImage     : false,
                /**
                 * Structure of object for validation text field API
                 * @param {String} name - title text-field
                 * @param {String} nameForState - this name will be store in Vuex
                 * @param {String} valueTextField - value of text field
                 * @param {Object} rules - ojbect with rules which need for text-field
                 * @param {Number} rules.minLength - minimal length for text-field(default is 1)
                 * @param {Number} rules.maxLength - maximum length for text-field(default is 25)
                 * @param {Number} rules.counter - max-counter string
                 * @param {Number} rules.hint - text hint for text-field
                 * @param {String} rules.mask - for example (###-##-###-##-##) - 375-29-111-11-11
                 * @param {Boolean} rules.notNecessary - field is't required (required is false)
                 * @param {Boolean} rules.required - this text-field is required (default value)
                 * @param {Boolean} rules.isSymbols - text-field should contain only symbols
                 * @param {Boolean} rules.isNumbers - text-field should contain only numbers
                 * @param {Boolean} rules.email - check content by email 
                 */
                 
                firstColumnInput: {
                    companyName: {
                        name           : 'Company name',
                        nameForState   : 'name',
                        valueTextField : '',

                        rules: {
                            hint  : 'Имя компании',
                            regex : /^[ \w?#&.,-:;"'`()]+$/
                        }
                    }
                },
                secondColumnInput: {
                    typeAdress: {
                        name           : 'Adress',
                        nameForState   : 'address1',
                        valueTextField : '',
						
                        rules: {
                            regex: /^[ \w-.,]+$/  
                        }
					},
					city: {
                        name           : 'City',
                        nameForState   : 'city',
                        valueTextField : '',

                        rules: {
                            regex: /^[\w-.,]+$/
                        }
					},
					state: {
                        name           : 'State',
                        nameForState   : 'stateRegion',
                        valueTextField : '',

                        rules: {
                            regex: /^[ \w-.,]+$/
                        }
					},
					zipCode: {
                        name           : 'ZIP code',
                        nameForState   : 'zipCode',
                        valueTextField : '',
						
                        rules: {
                            isNumbers : true,
                            minLength : 6,
                            maxLength : 6
                        }
                    }
                },
                /**
                 * Structure of object for validation select field API
                 * @param {String} name - title text-field
                 * @param {String} nameForState - this name will be store in Vuex
                 * @param {String} valueSelect - value for v-model attr
                 * @param {Array} array data for select
                 * @param {Boolean} rules.required - this select field is required (default true)
                 */
                secondColumnSelect: {
                    country: {
                        name         : 'Country',
                        nameForState : 'country',
                        valueSelect  : '',
                        dataArray    : []
                    }
                },
				thirdColumnInput: {
                    phone: {
                        name           : 'Phone',
                        nameForState   : 'phone',
                        valueTextField : '',

                        rules: {
                            isNumbers : true,
                            mask      : '+# ### ###-####',
                            minLength : 11,
                            maxLength : 11
						}		
					},
					email: {
                        name           : 'E-mail',
                        nameForState   : 'email',
                        valueTextField : '',

                        rules: {
                            email : true,
                            regex : /^[^\s@]+@[^\s@]+\.[^\s@]+$/
						}		
					},
					website: {
                        name           : 'Website',
                        nameForState   : 'website',
                        valueTextField : '',

                        rules: {
                            notNecessary : true,
                            regex        : /^[\w\-\s]*$/ 
						}		
                    }
                }
            };
        }
    };
</script>

<style lang="scss">
    .main-container {
        background-color : var(--v-mono1-base);
        padding          : 100px 80px 0 24px; 
		height           : calc(100vh - 144px);

        .container__main-content {
			height: 100%;

            .main-content__first-column, {
                p {
                    font-size : 1.9rem;
                    margin    : 0;
                }

                .first-column__image-cotainer {
                    width       : 252px;
                    padding-top : 38px;
                    margin      : auto;

                    .image-container__action-container-image {
                        height           : 80px; 
                        background-color : var(--v-mono2-base);

                        button {
                            width          : 100%; 
                            height         : 100%;
                            margin         : 0;
                            text-transform : lowercase;
                            color          : var(--v-mono3-base);
                        }
                        
                        div {
                            max-height: 80px;
                        }
                    }
                }

                .first-column__text-field {
                    padding: 0;
                }
            }

			.main-content__second-column {
				padding-top: 135px;

				p {
					margin	  : 0;
					font-size : 1.2rem;
					color     : var(--v-mono6-base);
                }
            }
			.main-content__third-column {
				padding-top: 135px;

				p {
					margin	  : 0;
					font-size : 1.2rem;
					color     : var(--v-mono6-base);
				}
			}
        }
    }

    .v-list__tile__title {
        color: var(--v-poly1Hover-base);
    }
</style>
