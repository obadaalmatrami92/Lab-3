$(function() {
    'use strict';

    let sortedBy = 'title';
    let currentPage = 'data/page-1.json';

    /**
     * Picture is a constructor that takes in
     */
    function Picture(pic) {
        this.imageurl = pic.image_url;
        this.title = pic.title;
        this.description = pic.description;
        this.keyword = pic.keyword;
        this.horns = pic.horns;
    }

    Picture.all = {};
    // TODO: add unique keywords per page
    Picture.allKeywords = new Set();

    /**
     *
     */
    Picture.prototype.toHtml = function() {
        let $template = $('#photo-template').html();
        let compiledTemplate = Handlebars.compile($template);
        return compiledTemplate(this);
    };

    // TODO:
    Picture.readJSON = (filePath) => {
        $.get(filePath, 'json')
            .then((data) => {
                let allAnimals = [];
                data.forEach((item) => {
                    allAnimals.push(new Picture(item));
                    Picture.allKeywords.add(item.keyword);
                });
                Picture.all[filePath] = allAnimals;
                Picture.populateFilter();
            })
            .then(() => {
                Picture.loadPictures(filePath);
            });
    };

    Picture.populateFilter = () => {
        $('option')
            .not(':first')
            .remove();

        Picture.allKeywords.forEach((keyword) => {
            $('#filterList').append(
                `<option value="${keyword}">${keyword.charAt(0).toUpperCase() +
          keyword.slice(1)}</option>`
            );
        });
    };

    Picture.loadPictures = (filePath) => {
        Picture.all[filePath] = Picture.all[filePath].sort((a, b) => {
            let sortType = $('.sortBtns:checked').val();
            if (sortType === 'title') {
                if (a.title.toLowerCase() > b.title.toLowerCase()) return 1;
                if (a.title.toLowerCase() < b.title.toLowerCase()) return -1;
                return 0;
            } else if (sortType === 'horns') {
                return b.horns - a.horns;
            }
        });

        Picture.all[filePath].forEach((pic) => {
            $('#animal-wrap').append(pic.toHtml());
        });
    };
    //else this

    // filters animals by keyword
    let _filterImages = () => {
        // on any change of the select dropdown list
        $('#filterList').on('change', () => {
            let selectedKeyword = $('select option:selected').val();

            // if elements are hidden and user selects default option in dropdown list,
            // shows those elements
            if (selectedKeyword === 'default') {
                $('.animal:hidden').show();
            } else {
                // takes jQuery matched set and converts to an array and iterates over each HTML element
                // and after converting each element back to a jQuery object (in order to use jQuery methods)
                // filters objects for only those with the class of the selected keyword
                $('.animal')
                    .toArray()
                    .forEach((val) => {
                        val = $(val);
                        if (!val.hasClass(selectedKeyword)) {
                            val.fadeOut(200);
                        } else {
                            val.fadeIn(200);
                        }
                    });
            }
        });
    };

    let navBtns = () => {
        // create HTML buttons
        $('#navigation').append(
            '<button class="navButtons" id="data/page-1.json" type="button">Page 1</button>' +
            '<button class="navButtons" id="data/page-2.json" type="button">Page 2</button>'
        );

        // add event listeners to buttons

        $('.navButtons').click(function(event) {
            // TODO:
            currentPage = event.target.id;
            $('.animal').remove();
            Picture.loadPictures(currentPage);
        });
        // hide current page and display clicked page
    };

    let sortBtns = () => {
        $('#sort').append(
            '<input class="sortBtns" value="title" type="radio" name="sort" checked> Sort by Title </input>' +
            '<input class="sortBtns" value="horns" name="sort" type="radio"> Sort by Horns </input>'
        );
        // add event lisitenters to buttons
        $('.sortBtns').on('click', function() {
            let checked = $('.sortBtns:checked').val();
            if (sortedBy !== checked) {
                sortedBy = checked;
                $('.animal').remove();
                Picture.loadPictures(currentPage);
            }
        });
    };

    $(() => {
        Picture.readJSON('data/page-1.json');
        Picture.readJSON('data/page-2.json');
        _filterImages();
        navBtns();
        sortBtns();
    });
});