define(["js/domReady","js/d10.playlistModule", "js/playlist"], function(foo, playlistModule, playlist) {

  var seconds2display = function(secs) {
    var d = new Date(1970,1,1,0,0,secs),
	   m = d.getMinutes(), s = d.getSeconds();
	m = m < 10 ? "0"+m : m;
	s = s < 10 ? "0"+s : s;
    return m+':'+s;
  };
  
  
var createInstance = function(container) {
  var secondsOfEvent = function (e) {
    if ( !playlist.driver().current() ) {
      return false;
    }
    var offset = ui.offset();
    var pix = e.pageX - offset.left;
    var pixMax = ui.width();
    var secs = playlist.driver().current().duration;
    var total_secs = parseInt(secs, 10);
    var currentSecs = total_secs / pixMax * pix;
    return currentSecs;
  }

	var module = new playlistModule("time",
		{
			"playlist:currentSongChanged": function() {
				var secs = playlist.driver().current().duration;
				var total_secs = parseInt(secs, 10);
				var d = new Date(1970,1,1,0,0,total_secs);
				total.html(seconds2display(total_secs));
				bar.setNetloadBar(playlist.driver().currentLoadProgress());
			},
			"playlist:ended": function() {
				bar.setBar(0);
				bar.setNetloadBar(0);
				total.empty();
				current.empty();
			},
			"playlist:currentTimeUpdate": function(e) {
                var duration = e.duration || 100;
                var pc = 100 / duration * e.currentTime;
				bar.setBar(pc);
				current.html(seconds2display(e.currentTime));
				
			},
			"playlist:currentLoadProgress": function(e) {
				bar.setNetloadBar(playlist.driver().currentLoadProgress());
			}
		},
		{}
	);
// 	return module;
// 	binder.addBindings(module.events);

	var ui, bar, total, current ;
	ui = container.find("div[name=progression]");
	bar = new progressbar();
	total = container.find(".totalTime");
	current = container.find(".currentTime");
// 	debug("documentReady",ui,bar,total,current);
// 	if ( module.enabled ) {
// 		binder.bind();d
// 	}

	function progressbar( ) {

		//var ui = widget_arg;
		var pmax = 0;  // x secs = y pixels
		var punit = 0; // 1 secs = punit pixels
		var current = 0;

		ui.css({ textAlign: 'left', position: 'relative', overflow: 'hidden' });
		var resized = $('div.timer',ui);
		$('div.netload',ui).css({ position: 'absolute', width: 0, height: '100%', overflow: 'hidden' });
		$('div.timer',ui).css({ position: 'absolute', width: 0, height: '100%', overflow: 'hidden' });
        
        var timeOverlay = null;
        var timeOverlaySize = {width:0, height: 0};
        var timeOverlayElem = null;
        var onMouseMove = function(e) {
          var secs = secondsOfEvent(e);
          if ( secs === false || secs === Infinity ) {
            return ;
          }
          if ( !timeOverlay ) {
            timeOverlay = $("<div class=\"yellowOverlay currentTimeContainer upArrow\">"+seconds2display(secs)+"</div>")
                            .data("seconds",secs)
                            .css("visibility","hidden")
                            .prependTo($("#player"));
            timeOverlay.css("visibility","visible");
            timeOverlayElem = timeOverlay.get(0);
          }
          timeOverlaySize =  {width: timeOverlay.outerWidth() / 2 - 1, height: timeOverlay.outerHeight() +10};

          if ( timeOverlay.data("seconds") != secs ) {
            timeOverlay.html(seconds2display(secs));
            timeOverlay.data("seconds",secs);
          }
          var cssPosition = {
            left: (e.pageX - timeOverlaySize.width) +"px",
            top: (ui.outerHeight() + ui.offset().top - container.offset().top +10) +"px"
          };
          timeOverlay.css(cssPosition);
        };
        
		ui.click(function(e) {
          if ( !module.isEnabled() )	return ;
          playlist.seek(secondsOfEvent(e));
		})
        .mousemove(onMouseMove)
        .mouseenter(onMouseMove)
        .mouseleave(function() {
          if ( timeOverlay ) {
            timeOverlay.remove();
            timeOverlay = null;
          }
        });

        this.lastSet = null;
		this.setBar = function(data) {
//           punit=ui.width() / pmax;
//           var width = Math.floor(punit*data);
          if ( this.lastSet === data ) {
            return ;
          }
          resized.css({width: data+"%"});
          this.lastSet = data;
		}

		this.setNetloadBar = function(data) {
          ui.find('div.netload').css({width: data+"%"});
		}
	}
	return module;
};


var mod = createInstance($("#player"));

playlist.modules[mod.name] = mod;
return mod;

});
