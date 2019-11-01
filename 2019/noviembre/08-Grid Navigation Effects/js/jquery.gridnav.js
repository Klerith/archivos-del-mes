(function($) {
	jQuery.fn.reverse = Array.prototype.reverse;
	
	var 
		// auxiliar functions
		aux		= {
			setup				: function( $wrapper, $items, opts ) {
				
				// set the wrappers position to relative
				$wrapper.css('position', 'relative');
				
				// save the items position
				aux.saveInitialPosition( $items );
				
				// set the items to absolute and assign top & left
				$items.each(function(i) {
					var $item 	= $(this);

					$item.css({
						position	: 'absolute',
						left		: $item.data('left'),
						top			: $item.data('top')
					});
				});
				
					// check how many items we have per row
				var rowCount 	= Math.floor( $wrapper.width() / $items.width() ),
					// number of items to show is rowCount * n rows
					shown		= rowCount * opts.rows,
					// total number of rows
					totalRows	= Math.ceil( $items.length / rowCount );
				
				// save this values for later
				var config			= {};
				config.currentRow	= 1;
				config.totalRows	= totalRows;
				config.rowCount 	= rowCount;
				config.shownItems	= shown;
				$wrapper.data('config', config);
				
				// show n rowns
				$wrapper.children(':gt(' + (shown - 1) + ')').hide();
				
				// assign row classes to the items
				$items.each(function(i) {
					var $item 	= $(this),
						row		= Math.ceil( (i + 1) / rowCount );
					
					$item.addClass('tj_row_' + row);		
				});
				
				nav.setup( $wrapper, $items, opts );
				
			},
			saveInitialPosition	: function( $items ) {
				$items.each(function(i) {
					var $item 	= $(this);
					
					$item.data({
						left		: $item.position().left + 'px',
						top			: $item.position().top + 'px'
					});									
				});
			}
		},
		// navigation types
		nav		= {
			setup			: function( $wrapper, $items, opts ) {
				nav[opts.type.mode].setup( $wrapper, $items, opts );
			},
			def				: {
				setup		: function( $wrapper, $items, opts ) {
					var config = $wrapper.data('config');

					$items.each(function(i) {
						var $item 	= $(this),
							row		= Math.ceil( (i + 1) / config.rowCount ),
							t,
							f = row % opts.rows;
					
						if( f === 1 ) {
							t = '0px';		
						} else if( f === 0 ) {
							t = (opts.rows - 1) * $items.height()  + 'px'; 
						} else {
							t = (f - 1) * $items.height() + 'px';
						}
						
						$item.css({ top	: t });
					});	
				},
				pagination	: function( $wrapper, dir, opts ) {
					var config = $wrapper.data('config');

					if( ( dir === 1 && config.currentRow + opts.rows > config.totalRows ) || 
						( dir === -1 && config.currentRow - opts.rows <= 0 )
					) {
						$wrapper.data( 'anim', false );
						return false;
					}
					
					var currentRows	= '', nextRows = '';
					
					for( var i = 0; i < opts.rows; ++i ) {
						currentRows += '.tj_row_' + (config.currentRow + i) + ',';
						
						(dir === 1)
							? nextRows	+= '.tj_row_' + (config.currentRow + opts.rows + i) + ','
							: nextRows	+= '.tj_row_' + (config.currentRow - 1 - i) + ',';
					}
					
					$wrapper.children(currentRows).hide();
					$wrapper.children(nextRows).show();
					
					(dir === 1) ? config.currentRow += opts.rows : config.currentRow -= opts.rows;
					
					$wrapper.data( 'anim', false );

					$wrapper.data('config', config);
				}
			},
			fade			: {
				setup		: function( $wrapper, $items, opts ) {
					// same like def mode
					nav['def'].setup( $wrapper, $items, opts );
				},
				pagination	: function( $wrapper, dir, opts ) {
					var config = $wrapper.data('config');

					if( ( dir === 1 && config.currentRow + opts.rows > config.totalRows ) ||
						( dir === -1 && config.currentRow - opts.rows <= 0 )
					) {
						$wrapper.data( 'anim', false );
						return false;
					}
					
					var currentRows	= '', nextRows = '';
					
					for( var i = 0; i < opts.rows; ++i ) {
						currentRows += '.tj_row_' + (config.currentRow + i) + ',';
						
						(dir === 1)
							? nextRows	+= '.tj_row_' + (config.currentRow + opts.rows + i) + ','
							: nextRows	+= '.tj_row_' + (config.currentRow - 1 - i) + ',';
					}
					
					$wrapper.children(currentRows).fadeOut( opts.type.speed, opts.type.easing );
					
					var $nextRowElements= $wrapper.children(nextRows),

						totalNextRows	= $nextRowElements.length,
						cnt				= 0;
						
					$nextRowElements.fadeIn( opts.type.speed, opts.type.easing, function() {
						++cnt;
						if( cnt === totalNextRows ) {
							$wrapper.data( 'anim', false );
						}	
					});
					
					(dir === 1) ? config.currentRow += opts.rows : config.currentRow -= opts.rows;

					$wrapper.data('config', config);
				}
			},
			seqfade			: {
				setup		: function( $wrapper, $items, opts ) {
					// same like def mode
					nav['def'].setup( $wrapper, $items, opts );
				},
				pagination	: function( $wrapper, dir, opts ) {
					var config = $wrapper.data('config');

					if( ( dir === 1 && config.currentRow + opts.rows > config.totalRows ) || 
						( dir === -1 && config.currentRow - opts.rows <= 0 )
					) {
						$wrapper.data( 'anim', false );
						return false;
					}
					
					var currentRows	= '', nextRows = '';
					for( var i = 0; i < opts.rows; ++i ) {
						currentRows += '.tj_row_' + (config.currentRow + i) + ',';
						
						(dir === 1)
						? nextRows	+= '.tj_row_' + (config.currentRow + opts.rows + i) + ','
						: nextRows	+= '.tj_row_' + (config.currentRow - 1 - i) + ',';
					}
					
					var seq_t	= opts.type.factor;
					
					var $currentRowElements;
					( dir === 1 )
						? $currentRowElements = $wrapper.children(currentRows)
						: $currentRowElements = $wrapper.children(currentRows).reverse();
						
					$currentRowElements.each(function(i) {
						var $el = $(this);
						setTimeout(function() {
							$el.fadeOut( opts.type.speed, opts.type.easing )
						}, seq_t + i * seq_t);
					});
					
					var $nextRowElements;
					( dir === 1 )
						? $nextRowElements = $wrapper.children(nextRows)
						: $nextRowElements = $wrapper.children(nextRows).reverse();
					
					var total_elems	= $nextRowElements.length,
						cnt			= 0;
					
					$nextRowElements.each(function(i) {
						var $el = $(this);
						setTimeout(function() {
							$el.fadeIn( opts.type.speed, opts.type.easing, function() {
								++cnt;
								if( cnt === total_elems ) { 
									$wrapper.data( 'anim', false );
								}	
							})
						}, (seq_t * 2) + i * seq_t);
					});
					
					(dir === 1) ? config.currentRow += opts.rows : config.currentRow -= opts.rows;

					$wrapper.data('config', config);
				}
			},
			updown			: {
				setup		: function( $wrapper, $items, opts ) {
					var config = $wrapper.data('config');

					$wrapper.children(':gt(' + (config.shownItems - 1) + ')').css('opacity', 0);
					
					$items.each(function(i) {
						var $item 	= $(this),
							row		= Math.ceil( (i + 1) / config.rowCount ),
							t		= $item.position().top,
							f = row % opts.rows;
						
						if( row > opts.rows ) {
							t = (opts.rows * $items.height());		
						}
						
						$item.css({ top	: t + 'px'});
					});
				},
				pagination	: function( $wrapper, dir, opts ) {
					var config = $wrapper.data('config');

					if( ( dir === 1 && config.currentRow + opts.rows > config.totalRows ) || 
						( dir === -1 && config.currentRow - 1 <= 0 )
					) {
						$wrapper.data( 'anim', false );
						return false;
					}
					
					var movingRows	= '';
					
					for( var i = 0; i <= opts.rows; ++i ) {
						( dir === 1 )
							? movingRows += '.tj_row_' + (config.currentRow + i) + ','
							: movingRows += '.tj_row_' + (config.currentRow + (i - 1)) + ',';
					}
					
					var $elements;
					
					( dir === 1 )
						? $elements = $wrapper.children(movingRows)
						: $elements = $wrapper.children(movingRows).reverse();
					
					var total_elems	= $elements.length,
						cnt			= 0;
					
					$elements.each(function(i) {
						var $el 		= $(this),
							row			= $el.attr('class'),
							animParam	= {},
							
							currentRow	= config.currentRow;
						
						// if first row fade out
						// if last row fade in
						// for all the rows move them up / down
						if( dir === 1 ) {
							if(  row === 'tj_row_' + (currentRow) ) {
								animParam.opacity	= 0;
							}
							else if( row === 'tj_row_' + (currentRow + opts.rows) ) {
								animParam.opacity	= 1;
							}
						}
						else {
							if(  row === 'tj_row_' + (currentRow - 1) ) {
								animParam.opacity	= 1;
							}
							else if( row === 'tj_row_' + (currentRow + opts.rows - 1) ) {
								animParam.opacity	= 0;
							}
						}
						
						$el.show();
						
						(dir === 1)
							? animParam.top = $el.position().top - $el.height() + 'px'
							: animParam.top = $el.position().top + $el.height() + 'px'
						
						$el.stop().animate(animParam, opts.type.speed, opts.type.easing, function() {
							if( parseInt( animParam.top ) < 0 || parseInt( animParam.top ) > $el.height() * (opts.rows - 1) )
								$el.hide();
							
							++cnt;
							if( cnt === total_elems ) {
								$wrapper.data( 'anim', false );
							}	
						});
					});
					
					(dir === 1) ? config.currentRow += 1 : config.currentRow -= 1;

					$wrapper.data('config', config);
				}
			},
			sequpdown		: {
				setup 		: function( $wrapper, $items, opts ) {
					// same like updown mode
					nav['updown'].setup( $wrapper, $items, opts );
				},
				pagination	: function( $wrapper, dir, opts ) {
					var config = $wrapper.data('config');

					if( ( dir === 1 && config.currentRow + opts.rows > config.totalRows ) || 
						( dir === -1 && config.currentRow - 1 <= 0 )	
					) {
						$wrapper.data( 'anim', false );
						return false;
					}
					
					var movingRows	= '';
					
					for( var i = 0; i <= opts.rows; ++i ) {
						( dir === 1 )
							? movingRows += '.tj_row_' + (config.currentRow + i) + ','
							: movingRows += '.tj_row_' + (config.currentRow + (i - 1)) + ',';
					}
					
					var seq_t	= opts.type.factor,
						$elements;
					
					var dircond	= 1;
					if( opts.type.reverse ) dircond = -1;
					( dir === dircond )
						? $elements = $wrapper.children(movingRows)
						: $elements = $wrapper.children(movingRows).reverse();
					
					var total_elems	= $elements.length,
						cnt			= 0;
					
					$elements.each(function(i) {
						var $el 		= $(this),
							row			= $el.attr('class'),
							animParam	= {},
							
							currentRow	= config.currentRow;
							
						setTimeout(function() {
							// if first row fade out
							// if last row fade in
							// for all the rows move them up / down
							if( dir === 1 ) {
								if(  row === 'tj_row_' + (currentRow) ) {
									animParam.opacity	= 0;
								}
								else if( row === 'tj_row_' + (currentRow + opts.rows) ) {
									animParam.opacity	= 1;
								}
							}
							else {
								if(  row === 'tj_row_' + (currentRow - 1) ) {
									animParam.opacity	= 1;
								}
								else if( row === 'tj_row_' + (currentRow + opts.rows - 1) ) {
									animParam.opacity	= 0;
								}
							}
							
							$el.show();
							
							(dir === 1)
								? animParam.top = $el.position().top - $el.height() + 'px'
								: animParam.top = $el.position().top + $el.height() + 'px'
							
							$el.stop().animate(animParam, opts.type.speed, opts.type.easing, function() {
								if( parseInt( animParam.top ) < 0 || parseInt( animParam.top ) > $el.height() * (opts.rows - 1) )
									$el.hide();
									
								++cnt;
								if( cnt === total_elems ) { 
									$wrapper.data( 'anim', false );
								}	
							});	
						}, seq_t + i * seq_t);
					});
					
					(dir === 1) ? config.currentRow += 1 : config.currentRow -= 1;

					$wrapper.data('config', config);
				}
			},
			showhide		: {
				setup 		: function( $wrapper, $items, opts ) {
					var config = $wrapper.data('config');

					$items.each(function(i) {
						var $item 	= $(this),
							row		= Math.ceil( (i + 1) / config.rowCount ),
							t,
							f = row % opts.rows;
						
						if( f === 1 ) {
							t = '0px';		
						} else if( f === 0 ) {
							t = (opts.rows - 1) * $items.height()  + 'px'; 
						} else {
							t = (f - 1) * $items.height() + 'px';
						}
						
						$item.css({ top	: t });
					});		
				},
				pagination	: function( $wrapper, dir, opts ) {
					var config = $wrapper.data('config');

					if( ( dir === 1 && config.currentRow + opts.rows > config.totalRows ) || 
						( dir === -1 && config.currentRow - opts.rows <= 0 )
					) {
						$wrapper.data( 'anim', false );
						return false;
					}
					
					var currentRows	= '', nextRows = '';
					
					for( var i = 0; i < opts.rows; ++i ) {
						currentRows += '.tj_row_' + (config.currentRow + i) + ',';
						
						(dir === 1)
							? nextRows	+= '.tj_row_' + (config.currentRow + opts.rows + i) + ','
							: nextRows	+= '.tj_row_' + (config.currentRow - 1 - i) + ',';
					}
					
					$wrapper.children(currentRows).hide( opts.type.speed, opts.type.easing );
					
					var $nextRowElements= $wrapper.children(nextRows),
						totalNextRows	= $nextRowElements.length,
						cnt				= 0;
						
					$nextRowElements.show( opts.type.speed, opts.type.easing, function() {
						++cnt;
						if( cnt === totalNextRows ) {
							$wrapper.data( 'anim', false );
						}	
					});
					
					(dir === 1) ? config.currentRow += opts.rows : config.currentRow -= opts.rows;

					$wrapper.data('config', config);
				}
			},
			disperse		: {
				setup 		: function( $wrapper, $items, opts ) {
					var config = $wrapper.data('config');

					$items.each(function(i) {
						var $item 	= $(this),
							row		= Math.ceil( (i + 1) / config.rowCount ),
							t,
							f = row % opts.rows;
					
						if( f === 1 ) {
							t = '0px';		
						} else if( f === 0 ) {
							t = (opts.rows - 1) * $items.height()  + 'px'; 
						} else {
							t = (f - 1) * $items.height() + 'px';
						}
						
						$item.css({ top	: t }).data('top', t);
					});
				},
				pagination	: function( $wrapper, dir, opts ) {
					var config = $wrapper.data('config');

					if( ( dir === 1 && config.currentRow + opts.rows > config.totalRows ) || 
						( dir === -1 && config.currentRow - opts.rows <= 0 )
					) {
						$wrapper.data( 'anim', false );
						return false;
					}
					
					var currentRows	= '', nextRows = '';
					for( var i = 0; i < opts.rows; ++i ) {
						currentRows += '.tj_row_' + (config.currentRow + i) + ',';
						
						(dir === 1)
							? nextRows	+= '.tj_row_' + (config.currentRow + opts.rows + i) + ','
							: nextRows	+= '.tj_row_' + (config.currentRow - 1 - i) + ',';
					}
					
					$wrapper.children(currentRows).each(function(i) {
						var $el = $(this);
						$el.stop().animate({
							left	: $el.position().left + Math.floor( Math.random() * 101 ) - 50 + 'px',
							top		: $el.position().top + Math.floor( Math.random() * 101 ) - 50 + 'px',
							opacity	: 0
						}, opts.type.speed, opts.type.easing, function() {
							$el.css({
								left	: $el.data('left'),
								top		: $el.data('top')
							}).hide();
						});
					});
					
					var $nextRowElements	= $wrapper.children(nextRows);
						total_elems			= $nextRowElements.length,
						cnt					= 0;
					
					$nextRowElements.each(function(i) {
						var $el = $(this);
						
						$el.css({
							left	: parseInt($el.data('left')) + Math.floor( Math.random() * 301 ) - 150 + 'px',	
							top		: parseInt($el.data('top')) + Math.floor( Math.random() * 301 ) - 150 + 'px',
							opacity	: 0
						})
						.show()
						.animate({
							left	: $el.data('left'),
							top		: $el.data('top'),
							opacity	: 1
						}, opts.type.speed, opts.type.easing, function() {
							++cnt;
							if( cnt === total_elems ) { 
								$wrapper.data( 'anim', false );
							}
						});
					});
					
					(dir === 1) ? config.currentRow += opts.rows : config.currentRow -= opts.rows;

					$wrapper.data('config', config);
				}
			},
			rows			: {
				setup 		: function( $wrapper, $items, opts ) {
					// same like def mode
					nav['def'].setup( $wrapper, $items, opts );
				},
				pagination	: function( $wrapper, dir, opts ) {
					var config = $wrapper.data('config');

					if( ( dir === 1 && config.currentRow + opts.rows > config.totalRows ) || 
						( dir === -1 && config.currentRow - opts.rows <= 0 )
					) {
						$wrapper.data( 'anim', false );
						return false;
					}
					
					var currentRows	= '', nextRows = '';
					for( var i = 0; i < opts.rows; ++i ) {
						currentRows += '.tj_row_' + (config.currentRow + i) + ',';
						
						(dir === 1)
							? nextRows	+= '.tj_row_' + (config.currentRow + opts.rows + i) + ','
							: nextRows	+= '.tj_row_' + (config.currentRow - 1 - i) + ',';
					}
					
					$wrapper.children(currentRows).each(function(i) {
						var $el 	= $(this),
							rownmb	= $el.attr('class').match(/tj_row_(\d+)/)[1],
							diff;
							
						if( rownmb%2 === 0 ) {
							diff = opts.type.factor;
						}
						else {
							diff = -opts.type.factor;
						}
						
						$el.stop().animate({
							left	: $el.position().left + diff + 'px',
							opacity	: 0
						}, opts.type.speed, opts.type.easing, function() {
							$el.css({
								left	: $el.data('left')
							}).hide();
						});
					});
					
					var $nextRowElements	= $wrapper.children(nextRows);
						total_elems			= $nextRowElements.length,
						cnt					= 0;
					
					$nextRowElements.each(function(i) {
						var $el = $(this),
							rownmb	= $el.attr('class').match(/tj_row_(\d+)/)[1],
							diff;
						
						if( rownmb%2 === 0 ) {
							diff = opts.type.factor;
						}
						else {
							diff = -opts.type.factor;
						}
						
						$el.css({
							left	: parseInt($el.data('left')) + diff + 'px',
							opacity	: 0
						})
						.show()
						.animate({
							left	: $el.data('left'),
							opacity	: 1
						}, opts.type.speed, opts.type.easing, function() {
							++cnt;
							if( cnt === total_elems ) { 
								$wrapper.data( 'anim', false );
							}
						});
					});
					
					(dir === 1) ? config.currentRow += opts.rows : config.currentRow -= opts.rows;

					$wrapper.data('config', config);
				}
			}
		},
		methods = {
			init 	: function( options ) {
				
				if( this.length ) {
					
					var settings = {
						rows	: 2,
						navL	: '#tj_prev',
						navR	: '#tj_next',
						type	: {
							mode		: 'def', 		// use def | fade | seqfade | updown | sequpdown | showhide | disperse | rows
							speed		: 500,			// for fade, seqfade, updown, sequpdown, showhide, disperse, rows
							easing		: 'jswing',		// for fade, seqfade, updown, sequpdown, showhide, disperse, rows	
							factor		: 50,			// for seqfade, sequpdown, rows
							reverse		: false			// for sequpdown
						}
					};
					
					return this.each(function() {
						
						// if options exist, lets merge them with our default settings
						if ( options ) {
							$.extend( settings, options );
						}
						
						var $el 			= $(this).css( 'visibility', 'hidden' ),
							// the ul
							$wrapper		= $el.find('ul.tj_gallery'),
							// the items
							$thumbs			= $wrapper.children('li'),
							total			= $thumbs.length,
							// the navigation elements
							$p_nav			= $(settings.navL),
							$n_nav			= $(settings.navR);
						
						// save current row for later (first visible row)
						//config.currentRow	= 1;
						
						// flag to control animation progress
						$wrapper.data( 'anim', false );
						
						// preload thumbs
						var loaded = 0;
						$thumbs.find('img').each( function(i) {
							var $img 	= $(this);
							$('<img/>').load( function() {
								++loaded;
								if( loaded === total ) {
									
									// setup
									aux.setup( $wrapper, $thumbs, settings );

									$el.css( 'visibility', 'visible' );
									
									// navigation events
									if( $p_nav.length ) {
										$p_nav.bind('click.gridnav', function( e ) {
											if( $wrapper.data( 'anim' ) ) return false;
											$wrapper.data( 'anim', true );
											nav[settings.type.mode].pagination( $wrapper, -1, settings );
											return false;
										});
									}
									if( $n_nav.length ) {
										$n_nav.bind('click.gridnav', function( e ) {
											if( $wrapper.data( 'anim' ) ) return false;
											$wrapper.data( 'anim', true );
											nav[settings.type.mode].pagination( $wrapper, 1, settings );
											return false;
										});
									}
									/*
									adds events to the mouse
									*/
									$el.bind('mousewheel.gridnav', function(e, delta) {
										if(delta > 0) {
											if( $wrapper.data( 'anim' ) ) return false;
											$wrapper.data( 'anim', true );
											nav[settings.type.mode].pagination( $wrapper, -1, settings );
										}	
										else {
											if( $wrapper.data( 'anim' ) ) return false;
											$wrapper.data( 'anim', true );
											nav[settings.type.mode].pagination( $wrapper, 1, settings );
										}	
										return false;
									});
									
								}
							}).attr( 'src', $img.attr('src') );
						});
						
					});
				}
			}
		};
	
	$.fn.gridnav = function(method) {
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.gridnav' );
		}
	};
})(jQuery);		
