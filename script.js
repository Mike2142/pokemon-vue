
// Vue app //
let app = new Vue({

    el: '.app',

    data: {
        userPokemon: '',
        strength:'',
        speed:'',
        food:'',
        pokemonImage: '',
        currentPokemonNumber: '',
        currentPokemonName: '',
    },

    methods: {

        copyAddress: function() {
            var copyText = document.querySelector(".email-address");

            /* Select the text field */
            copyText.select();
            copyText.setSelectionRange(0, 99999); /*For mobile devices*/

            /* Copy the text inside the text field */
            document.execCommand("copy");

            /* Alert the copied text */
            let emailButton = document.querySelector('.end-popup__author');
            emailButton.innerHTML = 'Адрес скопирован';
            window.setTimeout(function(){ emailButton.innerHTML = 'Напиши автору'}, 1200);
        },

        gameOver: function() {

            this.eraseProgress();

            // Вызываем попап-титры
            let popupLink = document.querySelector('.open-popup-link');
            popupLink.click()

        },

        saveProgress: function() {
            let pokemonList = document.querySelectorAll('.savedPokemon');
            let numberList = [];
            pokemonList.forEach ( function (pokemon) {
                let number = pokemon.getAttribute('data-number');
                numberList.push(number);
            })
            window.localStorage.setItem('pokemonNumbers', numberList);

            let currentExp = document.querySelector('.pokemon__exp-current');
            window.localStorage.setItem('expWidth', currentExp.style.width);

            let expTitle = document.querySelector('.pokemon__exp-total').classList
            window.localStorage.setItem('expTitle', expTitle);
        },

        loadProgress: async function(){

            let savedExp = window.localStorage.getItem('expWidth');
            let currentExp = document.querySelector('.pokemon__exp-current').style;
            if (savedExp) {
                currentExp.width = savedExp;
            } else {
                this.showFirst();
            }

            let expTitle = window.localStorage.getItem('expTitle');
            let titleElement = document.querySelector('.pokemon__exp-total');
            if (expTitle) {
                expTitle = expTitle.split(' ')
                expTitle.forEach ( function( titleClass ) {
                    titleElement.classList.add(titleClass);
                })
            }

            let pokemonList = window.localStorage.getItem('pokemonNumbers');
            if (pokemonList) {

                pokemonList = pokemonList.split(',');
                async function renderList(pokemonNumber) {

                    let pokemonName;
                    let pokemonImage;

                    async function getNameAndImagebyNumber(pokemonNumber) {

                        let request = new XMLHttpRequest();

                        let getPokemonDataBase = new Promise((resolve, reject) =>
                        {

                            request.open('GET', 'https://pokeapi.co/api/v2/pokemon/' + pokemonNumber, true);

                            request.onload = function ()
                            {
                                let data = JSON.parse(this.response);
                                resolve(data);
                            };

                            request.send();
                        });

                        let pokemonArray = await getPokemonDataBase;

                        pokemonName = pokemonArray.name;
                        pokemonImage = pokemonArray.sprites.front_default;
                    }

                    await getNameAndImagebyNumber(pokemonNumber);

                    let pokemonTemplate = Vue.extend({
                        template: "<div class='savedPokemon' @click= 'showSaved($event)' data-number =" + pokemonNumber + ' >' + pokemonName +  "<img class='savedPokemon__img' src=" + pokemonImage + "></div>",
                        methods : {

                            showSaved: async function(event) {

                                function resetBackground() {
                                    let elems = document.querySelectorAll('.savedPokemon');
                                    let index = 0, length = elems.length;
                                    for ( ; index < length; index++) {
                                        elems[index].style.background = "";
                                    }
                                }
                                resetBackground();
                                this.$el.style.background = '#1A6868';

                                let number = this.$el.getAttribute('data-number');
                                app.getDataAndRender(number).then(
                                    document.body.querySelector('.evo-btn').style.display = 'none',
                                    document.body.querySelector('.pet-btn').style.display = 'block',
                                )
                            },
                        },
                    })

                    let savedPokemon = new pokemonTemplate().$mount()
                    document.querySelector('.pokemon__item-save').append(savedPokemon.$el)

                }

                for (pokemon in pokemonList) {
                    await renderList(pokemonList[pokemon])
                }

                let firstPokemon =  document.querySelector('.savedPokemon');
                if (firstPokemon) {
                    document.querySelector('.savedPokemon').click()
                }
            }
    
        },

        eraseProgress: function() {
            window.localStorage.removeItem('pokemonNumbers');
            window.localStorage.removeItem('expWidth');
            window.localStorage.removeItem('expTitle');
        },

        exp: function(expGained) {

            let currentExp = document.querySelector('.pokemon__exp-current');
            let currentExpWidth = parseInt( currentExp.style.width, 10 ) || 0;

            let newExpWidth = currentExpWidth + expGained;
            let userTitle = document.querySelector('.pokemon__exp-total');

            if ( newExpWidth >= 570 || expGained == 'finish' ) {
                newExpWidth = 570;
                this.gameOver();
                return
            } else if ( newExpWidth >= 456 ) {
                userTitle.classList.add("god")
            } else if (newExpWidth >= 342) {
                userTitle.classList.add('master')
            } else if (newExpWidth >= 228) {
                userTitle.classList.add('prettyGuy')
            } else if (newExpWidth >= 114) {
                userTitle.classList.add('goodGuy')
            }

            currentExp.style.transition = "all 0.6s";
            currentExp.style.width = newExpWidth + 'px';

            this.saveProgress()

            // Tier 114
            // Total 570

        },

        save: function() {

            if ( !document.querySelector( `div[data-number = '${currentPokemonNumber}' ]` ) )
            {
                let pokemonTemplate = Vue.extend({
                    template: "<div class='savedPokemon' @click= 'showSaved($event)' data-number =" + currentPokemonNumber + ' >' + this.userPokemon
                     +  "<img class='savedPokemon__img' src=" + this.pokemonImage + "> </div>",
                    methods : {

                        showSaved: async function(event) {

                            function resetBackground() {
                                let elems = document.querySelectorAll('.savedPokemon');
                                let index = 0, length = elems.length;
                                for ( ; index < length; index++) {
                                    elems[index].style.background = "";
                                }
                            }
                            resetBackground();
                            this.$el.style.background = '#1A6868';

                            let number = this.$el.getAttribute('data-number');
                            app.getDataAndRender(number).then(
                                document.body.querySelector('.evo-btn').style.display = 'none',
                                document.body.querySelector('.pet-btn').style.display = 'block',
                            )
                        },
                    },
                })

                let savedPokemon = new pokemonTemplate().$mount()
                let allSaved = document.querySelectorAll('.savedPokemon');

                if ( allSaved.length > 7 ) {
                    this.exp('finish');
                } else {
                    this.exp(25);
                    document.querySelector('.pokemon__item-save').append(savedPokemon.$el)
                    this.showRandom();
                }

            } else {
                let saveButton = document.querySelector('.save-btn');
                saveButton.innerHTML = 'Уже пойман';
                saveButton.style.background = 'grey'
                function restoreStyle() {saveButton.innerHTML = 'Поймать', saveButton.style.background = 'brown'}
                window.setTimeout( restoreStyle, 1000 );
            }

        },

        pet: function() {
            let image = document.querySelector('.pokemon__image');
            let random =  Math.round((Math.random() * 110))

            if ( random <= 40 ) {

                image.style.transition = "all 0.3s";
                image.style.transform = 'translate(30px)';

                image.style.transition = "all 0.6s";
                window.setTimeout( function() {image.style.transform = 'translate(-30px)'}, 300)

                image.style.transition = "all 0.3s";
                window.setTimeout( function() {image.style.transform = 'translate(0px)'}, 600)

            } else if ( random < 70 ) {

                image.style.transition = "all 0.3s";
                image.style.transform = 'scale(1.2)';

                image.style.transition = "all 0.6s";
                window.setTimeout( function() {image.style.transform = 'scale(0.8)'}, 300)

                image.style.transition = "all 0.3s";
                window.setTimeout( function() {image.style.transform = 'scale(1)'}, 600)


            } else if ( random >= 70 ) {

                image.style.transition = "all 0.3s";
                image.style.transform = 'translate(0,15px)';

                image.style.transition = "all 0.6s";
                window.setTimeout( function() {image.style.transform = 'translate(0,-30px)'}, 300)

                image.style.transition = "all 0.3s";
                window.setTimeout( function() {image.style.transform = 'translate(0px)'}, 600)

            }

        },

        showFirst: async function ()
        {

            currentPokemonNumber = 1;
            await this.getDataAndRender(currentPokemonNumber);
            this.checkEvo();

        },

        showRandom: async function ()
        {
            function resetBackground() {
                let elems = document.querySelectorAll('.savedPokemon');
                let index = 0, length = elems.length;
                for ( ; index < length; index++) {
                    elems[index].style.background = "";
                }
            }
            resetBackground();
            document.body.querySelector('.evo-btn').style.display = 'none';

            currentPokemonNumber = Math.ceil((Math.random() * 151));
            //currentPokemonNumber = 1;
            await this.getDataAndRender(currentPokemonNumber);
            document.body.querySelector('.pet-btn').style.display = 'none';
            this.checkEvo();
            this.exp(10);
        },

        checkEvo: async function ()
        {
            document.body.querySelector('.evo-btn').style.display = 'none'

            let checkEvo = await this.getEvoNumber();
            if (checkEvo)
            {
                document.body.querySelector('.evo-btn').style.display = 'block'
            }

        },

        showEvo: async function ()
        {

            currentPokemonNumber = await this.getEvoNumber();
            if (currentPokemonNumber) {
                this.getDataAndRender(currentPokemonNumber);
                this.checkEvo()
                this.exp(20);
            } else {
                document.body.querySelector('.evo-btn').style.display = 'none'
            }

        },

        getEvoNumber: async function ()
        {

            let request = new XMLHttpRequest();
            let getPokeData = new Promise((resolve, reject) =>
            {
                request.open('GET', 'https://pokeapi.co/api/v2/pokemon-species/' + currentPokemonNumber, true);
                request.onload = function ()
                {
                    let data = JSON.parse(this.response);
                    resolve(data);
                };
                request.send();
            })

            let pokeData = await getPokeData;
            let evoChainUrl = pokeData.evolution_chain.url
            let getEvoChain = new Promise((resolve, reject) =>
            {
                request.open('GET', evoChainUrl, true);
                request.onload = function ()
                {
                    let data = JSON.parse(this.response);
                    resolve(data);
                };
                request.send();
            })

            let evoChain = await getEvoChain;

            let evoPokeName2 = 'none';
            if (evoChain.chain.evolves_to.length > 0)
            {
                evoPokeName2 = evoChain.chain.evolves_to[0].species.name;
            } else
            {
                return false
            }

            let evoPokeName3 = 'none';
            if (evoChain.chain.evolves_to[0].evolves_to.length > 0)
            {
                evoPokeName3 = evoChain.chain.evolves_to[0].evolves_to[0].species.name;
            }

            let evoPokeUrl;

            if (currentPokemonName == evoPokeName2)
            {
                if (evoPokeName3 == 'none')
                {
                    return false
                }
                evoPokeUrl = evoChain.chain.evolves_to[0].evolves_to[0].species.url;
                document.body.querySelector('.evo-btn').style.display = 'none';
            } else if (currentPokemonName == evoPokeName3)
            {
                return false
            } else
            {
                evoPokeUrl = evoChain.chain.evolves_to[0].species.url;
            }

            let getEvoPokeData = new Promise((resolve, reject) =>
            {
                request.open('GET', evoPokeUrl, true);
                request.onload = function ()
                {
                    let data = JSON.parse(this.response);
                    resolve(data);
                };
                request.send();
            })

            let evoPokeData = await getEvoPokeData;
            let evoPokeNumber = evoPokeData.id;
            return evoPokeNumber;
        },

        getDataAndRender: async function (pokemonNumber)
        {
            let request = new XMLHttpRequest();

            let getPokemonDataBase = new Promise((resolve, reject) =>
            {

                request.open('GET', 'https://pokeapi.co/api/v2/pokemon/' + pokemonNumber, true);

                request.onload = function ()
                {
                    let data = JSON.parse(this.response);
                    resolve(data);
                };

                request.send();
            });

            let pokemonArray = await getPokemonDataBase;

            // Рендер имени
            this.userPokemon = pokemonArray.name;
            this.userPokemon = this.userPokemon.charAt(0).toUpperCase() + this.userPokemon.substring(1);

            // Рендер изображений
            this.pokemonImage = pokemonArray.sprites.front_default;

            // Рендер статов
            let stats = pokemonArray.stats
            this.strength = stats[4].base_stat
            this.speed = stats[0].base_stat
            this.food = stats[5].base_stat

            // Обновляем переменные для других функций
            currentPokemonName = pokemonArray.name;
            currentPokemonNumber = pokemonNumber;

        }
    },

    watch: {},

    created: async function ()
    {
        this.loadProgress();
    },

});



let sound = false;
let soundBtn = document.querySelector('.sound-btn');
let musicBox = document.querySelector('.music-box');

soundBtn.addEventListener('click', function() {

    if (sound == false) {
        musicBox.volume = 0.2;
        musicBox.play();
        sound = true
        soundBtn.style.textDecoration = 'line-through'
    } else {
        musicBox.pause();
        sound = false
        soundBtn.style.textDecoration = 'none'
    }

});


$('.open-popup-link').magnificPopup({
  type:'inline',
  midClick: true, // Allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source in href.
  mainClass: 'mfp-fade',
  closeOnBgClick: false,
  closeBtnInside: false,
  showCloseBtn: false,
});