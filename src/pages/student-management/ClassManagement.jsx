import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import {
  getStudentsByClassId,
  saveStudent,
  updateStudent,
  deleteStudent,
} from "../../api/student";
import "./ClassManagement.css";

const getStudentName = (record) =>
  record?.name || record?.student_name || record?.studentName || "-";

const getStudentNo = (record) =>
  record?.studentNo || record?.student_no || record?.studentCode || "-";

const deriveGenderValue = (record) => {
  const value =
    record?.gender ??
    record?.gender_flag ??
    record?.genderFlag ??
    record?.sex ??
    record?.is_male ??
    record?.isMale;

  if (typeof value === "boolean") {
    return value;
  }

  if (value === 1 || value === "1") {
    return true;
  }

  if (value === 0 || value === "0") {
    return false;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["男", "male", "m", "true"].includes(normalized)) {
      return true;
    }
    if (["女", "female", "f", "false"].includes(normalized)) {
      return false;
    }
  }

  return true;
};

const attachRowKey = (list) =>
  list.map((item, index) => {
    const candidate =
      item._rowKey ??
      item.id ??
      item.studentId ??
      item.student_id ??
      item.studentNo ??
      item.student_no ??
      `student-${index}`;
    return { ...item, _rowKey: candidate };
  });

const ClassManagement = () => {
  const { classList, selectedClassId } = useSelector((state) => state.class);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form] = Form.useForm();

  const currentClass = useMemo(() => {
    if (!classList || !classList.length) {
      return null;
    }
    if (selectedClassId) {
      return (
        classList.find((item) => item.class_id === selectedClassId) ||
        classList[0]
      );
    }
    return classList[0];
  }, [classList, selectedClassId]);

  const loadStudents = useCallback(async () => {
    if (!currentClass?.class_id) {
      setStudents([]);
      return;
    }
    setLoading(true);
    try {
      const response = await getStudentsByClassId(currentClass.class_id);
      const list = Array.isArray(response?.data) ? response.data : [];
      setStudents(attachRowKey(list));
    } catch (error) {
      console.error("获取学生列表失败:", error);
      message.error("获取学生列表失败，请稍后重试");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [currentClass]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const openModal = (record = null) => {
    setEditingStudent(record);
    if (record) {
      form.setFieldsValue({
        name: getStudentName(record) === "-" ? undefined : getStudentName(record),
        studentNo: getStudentNo(record) === "-" ? undefined : getStudentNo(record),
      });
    } else {
      form.resetFields();
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingStudent(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    if (!currentClass?.class_id) {
      message.warning("请先选择班级");
      return;
    }
    try {
      const values = await form.validateFields();
      const payload = {
        student_name: values.name.trim(),
        student_no: values.studentNo.trim(),
        gender: deriveGenderValue(editingStudent),
      };

      if (editingStudent) {
        const updatePayload = {
          ...payload,
          id:
            editingStudent?.id ??
            editingStudent?.studentId ??
            editingStudent?.student_id ??
            null,
          class_id: currentClass.class_id,
        };
        if (updatePayload.id === null || updatePayload.id === undefined) {
          message.error("未找到该学生的ID，请刷新后重试");
          return;
        }
        await updateStudent(updatePayload);
        message.success("学生信息已更新");
      } else {
        await saveStudent(payload, currentClass.class_id);
        message.success("学生已新增");
      }
      closeModal();
      loadStudents();
    } catch (error) {
      if (error?.errorFields) {
        return;
      }
      console.error("保存学生信息失败:", error);
      message.error("保存学生信息失败，请稍后重试");
    }
  };

  const handleDelete = (record) => {
    const studentNo = getStudentNo(record);
    if (!studentNo || studentNo === "-") {
      message.warning("该学生缺少学号，无法删除");
      return;
    }

    Modal.confirm({
      title: `确认删除学生「${getStudentName(record)}」吗？`,
      okText: "删除",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        try {
          await deleteStudent(studentNo);
          message.success("学生已删除");
          loadStudents();
        } catch (error) {
          console.error("删除学生失败:", error);
          message.error("删除失败，请稍后重试");
        }
      },
    });
  };

  const columns = [
    {
      title: "姓名",
      dataIndex: "name",
      render: (_, record) => getStudentName(record),
    },
    {
      title: "学号",
      dataIndex: "studentNo",
      render: (_, record) => getStudentNo(record),
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="class-management-page">
      <Card className="class-student-card">
        <div className="class-card-header">
          <h2>班级学生列表</h2>
          <span>
            {currentClass
              ? `${currentClass.name || currentClass.class_name || "当前班级"} · 当前共 ${students.length} 人`
              : "暂无班级数据，请先通过导航栏选择班级"}
          </span>
        </div>

        <div className="class-table-actions">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
            disabled={!currentClass}
          >
            新增学生
          </Button>
        </div>

        <Table
          className="class-table-equal"
          columns={columns}
          dataSource={students}
          rowKey={(record) => record._rowKey}
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `共 ${total} 名学生`,
          }}
        />
      </Card>

      <Modal
        title={editingStudent ? "编辑学生" : "新增学生"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={closeModal}
        okText="保存"
        cancelText="取消"
      >
        <Form layout="vertical" form={form}>
          <div className="class-form-grid">
            <Form.Item
              name="name"
              label="学生姓名"
              rules={[{ required: true, message: "请输入学生姓名" }]}
            >
              <Input placeholder="请输入学生姓名" />
            </Form.Item>
            <Form.Item
              name="studentNo"
              label="学号"
              rules={[{ required: true, message: "请输入学号" }]}
            >
              <Input placeholder="请输入学号" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ClassManagement;
