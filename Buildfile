# ==========================================================================
# Ki - Buildfile
# Copyright: (c) 2010 - Michael Cohen, and contributors
# License: Licensed under MIT license (see license.js)
# ==========================================================================


config :all, 
  :required => ['sproutcore/runtime'],
  :test_required  => ['sproutcore/runtime', 'sproutcore/foundation', 'sproutcore/desktop'],
  :debug_required => ['sproutcore/runtime', 'sproutcore/foundation', 'sproutcore/desktop']

mode :debug do
  config :all, 
    :combine_javascript => true,
    :combine_stylesheet => true
end
  
# CORE FRAMEWORKS
config :foundation, :required => []

# WRAPPER FRAMEWORKS
config :ki, :required => [:foundation]

# SPECIAL THEMES
# These do not require any of the built-in SproutCore frameworks
%w(standard_theme empty_theme).each do |target_name|
  config target_name, 
    :required => [], :test_required => [], :debug_required => []
end

# CONFIGURE THEMES
config :empty_theme, 
  :theme_name => 'empty-theme',
  :test_required  => ['sproutcore/testing'],
  :debug_required => ['sproutcore/debug']

config :standard_theme, 
  :required => :empty_theme, 
  :theme_name => 'sc-theme',
  :test_required  => ['sproutcore/testing'],
  :debug_required => ['sproutcore/debug']