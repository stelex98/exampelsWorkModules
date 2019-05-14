<template>
    <v-layout row wrap justify-center>
        <v-flex md12>
            <v-select
                class           = "select-action-input__select-item"
                :items          = "dataArray"   
                item-value      = "id"
                item-text       = "name"
                :label          = "name"
                v-model         = "currentValueSelect"
                :error-messages = "checkErrors"
                @input          = "checkNotNecessaryBlur"
                @blur           = "$v.currentValueSelect.$touch();"
                return-object 
            ></v-select>
        </v-flex>
    </v-layout>
</template>

<script>
    import { required }        from 'vuelidate/lib/validators';
    import { validationMixin } from 'vuelidate';
    import { mapMutations }    from 'vuex';

    export default {
        props: {
            name: {
                type: String
            },
            nameForState: {
                type: String
            },
            valueSelect: {
                type: Object
            },
            dataArray: {
                type: Array
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
                currentValueSelect: ''
            };
        },
        beforeMount() {
            this.rules.required = this.rules.required === undefined
                ? required 
                : this.rules.required;
            this.currentValueSelect = this.valueSelect;
        },
        computed: {
            checkErrors() {
                const errors = [];

                if (!this.$v.currentValueSelect.$dirty) return errors;
                
                !this.$v.currentValueSelect.required  && errors.push('Это обязательное поле');

                return errors;
            }
        },
        validations() {
            return {
                currentValueSelect: {
                    required: (this.rules.required ? required : {})
                }
            };
        },
        methods: {
            ...mapMutations('companyProfile/basic', [ 'writeDataIntoState' ]),

            checkNotNecessaryBlur() {
                const obj = {};

                this.$v.currentValueSelect.$touch();

                obj[this.nameForState] = this.currentValueSelect;

                this.writeDataIntoState(obj);

                this.$emit('globalError', {
                    globalError: this.$v.$invalid
                });
            }
        }
    };
</script>

<style lang="scss">
    .input-address-actions__select-action-input {
        .v-input--has-state.error--text .v-label {
            animation: none;
        }
        .v-messages.error--text {
            color: var(--v-poly6-base);
        }    
        .v-select__slot {
            .v-label.v-label--active {
                color: var(--v-mono6-base);
            }
            .v-select__selections {
                color: var(--v-mono5-base);
            }
            .v-label {
                color: var(--v-mono5-base);
            }
            .v-label--active.white--text{
                color: var(--v-mono6-base);
            }
            i {
                color: var(--v-mono6-base);
            }
        }
    }
</style>
