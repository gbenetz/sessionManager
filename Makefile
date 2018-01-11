ZIP = zip
PKG = sessionManager.zip
#files = $(filter-out temp.$(1), $(wildcard $(1)/*.$(1)))

define files 
$(filter-out ${1}/temp.${1},$(wildcard ${1}/*.${1}))
endef

HTML = $(call files,html)
JS = $(call files,js)
CSS = $(call files,css)
MAN = manifest.json
ICO = $(wildcard icons/*)
IMG = $(wildcard images/*)

.PHONY: all clean

all: $(PKG)

$(PKG): $(MAN) $(HTML) $(JS) $(CSS) $(ICO) $(IMG)
	$(ZIP) -u $(PKG) $^

clean:
	rm -rf $(PKG)
