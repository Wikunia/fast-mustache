/* @flow */
require.config({
    paths: {
        text: "requirejs/text"
    }
});
  
require(['text!../templates/home.html'],
function(homeTmpl){
    var parsedTmpl  = Mustache.parse(homeTmpl);
    var tmplTree    = Mustache.getTree(parsedTmpl);
    
    var timeoutMS = 20000;
    reloadFunc();
    
    
    /**
     * Reload the production lines if necessary 
     */
    function reloadFunc() {
        $.get('api.php', function(data) {
            console.time('home');
            var data = JSON.parse(data);
//            console.log('data: ',JSON.stringify(data,null,2));
            console.time('render');
            Mustache.renderFast('#home', homeTmpl, '#home', tmplTree, data);
            console.timeEnd('render');
            
            console.timeEnd('home');
        });  

    }
    
    $(document).on('click','.test_nr', function() {
        reloadFunc();
    });
    
    
	/**
	 * Combine templates a template can include other templates with
	 * - `{{> fileName.html}}` The file must be required with partTemplates.fileName
	 * @param   {String} template template content which can include other templates (recursive)
	 * @returns {String} combined template
	 */
	function _combineTemplates(template) {
		return template.replace(/{{> (.*?)}}/g,function(match,p1) {
            p1 = p1.replace('/','_');
			return _combineTemplates(partTemplates[p1]);
		});
	}
        
});
    