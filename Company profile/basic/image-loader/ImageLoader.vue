<template>
    <v-flex
        class = "pa-0 ma-0"
        v-if  = "replace || newImg"
    >
        <v-layout
            class = "image-container__action-container-image"
            v-if  = "replace" 
            row
        >
            <v-flex
                class = "action-container-image__button-replace-image"
            >
                <v-btn
                    class = "mono6--text" 
                    @click = "pickFile" 
                    flat
                >
                    replace
                </v-btn>
                    <input  
                        type    = "file"
                        ref     = "image"
                        accept  = "image/*"
                        @change = "onFilePicked"  
                    >
            </v-flex>
            <v-flex
                class = "action-container-image__button-delete-image"
            >
                <v-btn 
                    class = "mono6--text"    
                    flat
                >
                    delete
                </v-btn>
            </v-flex>
        </v-layout> 

        <v-layout 
            class = "add-new-image text-xs-center"
            v-if  = "newImg"
        >
            <v-btn
                class  = "pr-5 mono5--text"
                color  = "mono3"
                @click = "pickFile" 
                round 
                dark 
            >
               <v-icon class = "pr-3 mono5--text">add</v-icon>
               logo 
            </v-btn>
            <input
                type    = "file"
                ref     = "image"
                accept  = "image/*"
                @change = "onFilePicked"  
            >
        </v-layout>
    </v-flex>
</template>

<script>
    import { mapMutations } from 'vuex';

    export default {
        data() {
            return {
                imageName : '',
                imageUrl  : '',
                imageFile : ''
            };
        },
        props: {
            replace: {
                type: Boolean
            },
            newImg: {
                type: Boolean
            }
        },
        methods: {
            ...mapMutations('companyProfile/basic', [ 'writeBase64Img' ]),
            
            pickFile() {
                this.$refs.image.click();
            },
            onFilePicked(e) {
                const { files } = e.target;

                if (files[0] !== undefined) {
                    this.imageName = files[0].name;

                    if (this.imageName.lastIndexOf('.') <= 0) {
                        return;
                    }
                    const fr = new FileReader();

                    fr.readAsDataURL(files[0]);

                    fr.addEventListener('load', () => {
                        this.imageUrl  = fr.result;
                        this.imageFile = files[0];

                        this.writeBase64Img(this.imageUrl);
                    });
                } 
                else {
                    this.imageName = '';
                    this.imageFile = '';
                    this.imageUrl  = '';
                }
            }
        }
    };
</script>

<style lang = 'scss'>

    .image-container__action-container-image {
        height           : 80px; 
        background-color : var(--v-mono3-base);

        button {
            width          : 100%; 
            height         : 100%;
            margin         : 0;
            text-transform : lowercase;
        }
        input {
            display: none
        }
    }

    .add-new-image {
        padding-top: 33px;

        button {
            width          : 120px;
            height         : 36px;
            text-transform : lowercase;
            font-size      : 14px;
            margin         : 5px auto;
        }
        input {
            display: none;
        }
    }
</style>
