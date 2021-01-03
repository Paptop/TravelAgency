suite('Test about screen', function(){
    test('Page must have a link to contact page', function(){
        assert($('a[href="/contact"]').length);
    });
});
