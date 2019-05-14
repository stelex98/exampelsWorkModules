<template>
    <v-layout row wrap justify-center>
        <v-flex md12>
            <v-text-field
                class  = "core-input"
                :class =  "{ 
                    'notNecessary'      : rules.notNecessary, 
                    'modify-text-input' : true 
                }"
                :counter        = "rules.counter"
                :hint           = "rules.hint"
                :mask           = "rules.mask"
                :label          = "name"
                v-model         = "currentTextField"
                :error-messages = "checkErrors"
                ref             = "textInputModified"
                @blur           = "checkNotNecessaryBlur"
                @input          = "$v.currentTextField.$touch();" 
            ></v-text-field>
        </v-flex>
    </v-layout>
</template>

<script>
    import { required, minLength, maxLength, email  } from 'vuelidate/lib/validators';
    import { validationMixin }                        from 'vuelidate';
    import { mapMutations }                           from 'vuex';

    export default {
        props: {
            name: {
                type: String
            },
            nameForState: {
                type: String
            },
            valueTextField: {
                type: String
            },
            rules: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        mixins: [ validationMixin ],
        data() {
            return {
                currentTextField: this.valueTextField
            };
        },
        beforeMount() {
            this.rules.required = this.rules.required === undefined
                ? required 
                : this.rules.required;
            this.rules.maxLength = this.rules.maxLength === undefined 
                ? 50 
                : this.rules.maxLength;

            if (this.rules.notNecessary) {
                this.notNecessary   = true;
                this.rules.required = false;
            }
        },
        computed: {
            checkErrors() {
                const errors = [];

                if (!this.$v.currentTextField.$dirty) return errors;
                
                !this.$v.currentTextField.minLength  && errors.push(`Минимальная длинна поля  ${ this.rules.minLength } символа.`);
            
                !this.$v.currentTextField.maxLength  && errors.push(`Максимальная длинна поля ${ this.rules.maxLength } символа.`);
                !this.$v.currentTextField.required   && errors.push('Это обязательное поле');
                !this.$v.currentTextField.email      && errors.push('Формат почты должен быть: name@domen.com');
                !this.$v.currentTextField.isNumbers  && errors.push('Поле должно содержать только цифры.');
                !this.$v.currentTextField.regex      && errors.push('Недопустимый формат ввода.');
                return errors;
            }
        },
        validations() {
            return {
                currentTextField: {
                    minLength : minLength(this.rules.minLength || 0),
                    maxLength : maxLength(this.rules.maxLength),
                    required  : (this.rules.required ? required : {}),
                    email     : (this.rules.email ? email : {}),
                    isNumbers : (this.rules.isNumbers ? (function () {
                        let re    = /\D/;
                        let model =  this.$v.currentTextField.$model;

                        return !re.test(model);
                    }) : ''),
                    regex: (this.rules.regex ? (function () {
                        let re    =  this.rules.regex;
                        let model =  this.$v.currentTextField.$model;

                        return re.test(model);
                    }) : '')
                }
            };
        },
        methods: {
            ...mapMutations('companyProfile/basic', [ 'writeDataIntoState' ]),

            checkNotNecessaryBlur() {
                this.$v.currentTextField.$touch();
                const obj = {};

                obj[this.nameForState] = this.currentTextField;

                this.writeDataIntoState(obj);

                this.$emit('globalError', {
                    globalError: this.$v.$invalid
                });
            }
        }
    };
</script>

<style lang="scss">
    .notNecessary {
        label:after{
            content      : 'No necessary';
            color        : var(--v-mono6-base);
            padding-left : 1rem;
        }

        label.v-label--active:after{
            content: '';
        }
    }
    .v-input--has-state.error--text .v-label {
        animation: none;
    }
    .v-input__slot:after {
        color: var(--v-mono5-base);
    }
    .modify-text-input {
        .v-messages.error--text {
            color: var(--v-poly6-base);
        }
        .error--text, .error--text .v-messages__wrapper {
            color: var(--v-poly6-base);
        } 
        .v-text-field__slot {
            input[type = 'text'] {
                color: var(--v-mono5-base);
            }
            .v-label.v-label--active {
                color: var(--v-mono6-base);
            }
            .v-label {
                color: var(--v-mono5-base);
            }
            .v-label--active.white--text {
                color: var(--v-mono6-base);
            }
        }
        .v-text-field__details {
            .v-messages{
                color: var(--v-mono6-base);
            }
        }
    }

    .v-text-field>.v-input__control>.v-input__slot:before {
        border-color: var(--v-mono6-base) !important;
    }

    .v-text-field.v-input--has-state > .v-input__control > .v-input__slot:before {
        border-color: var(--v-poly6-base) !important;
    }

</style>
