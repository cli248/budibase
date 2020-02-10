import { setupBinding } from "../state/stateBinding"
import { split, last } from "lodash/fp"
import { $ } from "../core/common"
import { renderComponent } from "./renderComponent"
import { isScreenSlot } from "./builtinComponents"

export const initialiseChildren = initialiseOpts => (
  childrenProps,
  htmlElement,
  anchor = null
) => {
  const {
    uiFunctions,
    bb,
    coreApi,
    store,
    componentLibraries,
    treeNode,
    frontendDefinition,
    hydrate,
    onScreenSlotRendered,
  } = initialiseOpts

  for (let childNode of treeNode.children) {
    childNode.destroy()
  }

  if (hydrate) {
    while (htmlElement.firstChild) {
      htmlElement.removeChild(htmlElement.firstChild)
    }
  }

  htmlElement.classList.add(`lay-${treeNode.props._id}`)

  const renderedComponents = []
  for (let childProps of childrenProps) {
    const { componentName, libName } = splitName(childProps._component)

    if (!componentName || !libName) return

    const { initialProps, bind } = setupBinding(
      store,
      childProps,
      coreApi,
      frontendDefinition.appRootPath
    )

    const componentConstructor = componentLibraries[libName][componentName]

    const renderedComponentsThisIteration = renderComponent({
      props: childProps,
      parentNode: treeNode,
      componentConstructor,
      uiFunctions,
      htmlElement,
      anchor,
      initialProps,
      bb,
    })

    if (
      onScreenSlotRendered &&
      isScreenSlot(childProps._component) &&
      renderedComponentsThisIteration.length > 0
    ) {
      // assuming there is only ever one screen slot
      onScreenSlotRendered(renderedComponentsThisIteration[0])
    }

    for (let comp of renderedComponentsThisIteration) {
      comp.unsubscribe = bind(comp.component)
      renderedComponents.push(comp)
    }
  }

  return renderedComponents
}

const splitName = fullname => {
  const componentName = $(fullname, [split("/"), last])

  const libName = fullname.substring(
    0,
    fullname.length - componentName.length - 1
  )

  return { libName, componentName }
}