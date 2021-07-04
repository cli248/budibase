<script>
  import { goto } from "@roxi/routify"
  import { datasources } from "stores/backend"
  import { notifications } from "@budibase/bbui"
  import { Input, Label, ModalContent } from "@budibase/bbui"
  import TableIntegrationMenu from "../TableIntegrationMenu/index.svelte"
  import analytics from "analytics"

  let error = ""

  let name
  let integration

  function checkValid(evt) {
    const datasourceName = evt.target.value
    if (
      $datasources?.list.some(datasource => datasource.name === datasourceName)
    ) {
      error = `Datasource with name ${datasourceName} already exists. Please choose another name.`
      return
    }
    error = ""
  }

  async function saveDatasource() {
    const { type, plus, ...config } = integration

    // Create datasource
    const response = await datasources.save({
      name,
      source: type,
      config,
      plus,
    })
    notifications.success(`Datasource ${name} created successfully.`)
    analytics.captureEvent("Datasource Created", { name, type })

    // Navigate to new datasource
    $goto(`./datasource/${response._id}`)
  }
</script>

<ModalContent
  title="新建数据源"
  size="L"
  confirmText="Create"
  onConfirm={saveDatasource}
  disabled={error || !name || !integration?.type}
>
  <Input
    data-cy="datasource-name-input"
    label="名称"
    on:input={checkValid}
    bind:value={name}
    {error}
  />
  <Label>数据源类型</Label>
  <TableIntegrationMenu bind:integration />
</ModalContent>
