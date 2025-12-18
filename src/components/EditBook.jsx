import { Form, Modal, Select, Input, InputNumber, Image } from "antd"
import { useEffect } from "react"

export default function EditBook(props) {
  const [form] = Form.useForm()

  const handleFormSubmit = () => {
    form.validateFields().then((formData) => {
      props.onSave?.(formData)
    })
  }

  useEffect(() => {
    if (props.isOpen && props.item) {
      form.setFieldsValue(props.item)
    }
  }, [props.isOpen, props.item, form])
  
  return(
    <Modal 
      title="Edit Book" 
      okText="Save" 
      cancelText="Cancel"
      open={props.isOpen} 
      onCancel={props.onCancel} 
      onOk={handleFormSubmit}>
      <Form form={form}>
        <Form.Item>
          <Image src={`http://localhost:3080/${props.item?.coverUrl}`} height={100} />
        </Form.Item>
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input/>
        </Form.Item>
        <Form.Item name="author" label="Author" rules={[{ required: true }]}>
          <Input/>
        </Form.Item>
        <Form.Item name="price" label="Price" rules={[{ required: true }]}>
          <InputNumber/>
        </Form.Item>
        <Form.Item name="stock" label="Stock" rules={[{ required: true }]}>
          <InputNumber/>
        </Form.Item>
        <Form.Item name="categoryId" label="Category" rules={[{ required: true }]}>
          <Select allowClear style={{width:"150px"}} options={props.categories}/>
        </Form.Item>
      </Form>
    </Modal>
  )
}