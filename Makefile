ZIP = zip
PKG = sessionManager.zip

define files
$(filter-out ${1}/temp.${1},$(wildcard ${1}/*.${1}))
endef

HTML = $(call files,html)
JS = $(call files,js)
CSS = $(call files,css)
MAN = manifest.json
ICO = $(wildcard icons/*.svg) icons/README.md
IMG = $(wildcard images/*.svg) images/README.md
HELP = $(shell find help -mindepth 1 ! -name '.*swp' -type f)

.PHONY: all clean

all: $(PKG)

$(PKG): $(MAN) $(HTML) $(JS) $(CSS) $(ICO) $(IMG) $(HELP) README.md LICENSE
	@echo $^
	$(ZIP) -u $(PKG) $^

clean:
	rm -rf $(PKG)
